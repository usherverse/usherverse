import { defineEventHandler, readBody } from "h3";
import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const specSchema = z.object({
  businessSummary: z.object({
    businessName: z.string(),
    industry: z.string(),
    targetAudience: z.string(),
    websiteGoals: z.string(),
  }),
  recommendedPages: z.array(z.string()),
  recommendedFeatures: z.array(z.string()),
  suggestedDesignStyle: z.string(),
  seoRecommendations: z.array(z.string()),
  userExperienceRecommendations: z.array(z.string()),
  detailedPrompt: z.string(),
});

export default defineEventHandler(async (event) => {
  try {
    const { messages } = await readBody(event);

    // ── Groq API keys ─────────────────────────────────────────────────────────
    const rawKeys = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "") as string;
    const apiKeys = rawKeys.split(",").map((k) => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      return new Response(JSON.stringify({ error: "No API keys configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const groqProvider = createGroq({ apiKey: apiKeys[0] });

    const conversationText = messages
      .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const { object } = await generateObject({
      model: groqProvider("openai/gpt-oss-20b"),
      mode: "json",
      schema: specSchema,
      prompt: `Based on the following website consultation conversation, generate a detailed website specification.

CONVERSATION:
${conversationText}

Generate a comprehensive website specification that includes all the key information discussed. For the detailedPrompt, write a thorough AI website builder prompt that a developer could use to build the exact website described.`,
    });

    // ── Save to Supabase ──────────────────────────────────────────────────────
    try {
      const supabaseUrl = process.env.SUPABASE_URL as string;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

      if (supabaseUrl && serviceRoleKey) {
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false },
        });

        await supabase.from("consultations").insert({
          status: "new",
          business_name: object.businessSummary.businessName,
          industry: object.businessSummary.industry,
          target_audience: object.businessSummary.targetAudience,
          website_goals: object.businessSummary.websiteGoals,
          recommended_pages: object.recommendedPages,
          recommended_features: object.recommendedFeatures,
          suggested_design_style: object.suggestedDesignStyle,
          seo_recommendations: object.seoRecommendations,
          ux_recommendations: object.userExperienceRecommendations,
          detailed_prompt: object.detailedPrompt,
          chat_history: messages,
        });
      }
    } catch (dbErr) {
      // Don't block the client response if DB save fails
      console.error("Supabase save error:", dbErr);
    }

    return new Response(JSON.stringify(object), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating spec:", error);
    return new Response(JSON.stringify({ error: "Failed to generate specification" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
