import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { getSupabaseAdmin } from "../lib/supabase";

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

export async function generateSpecHandler(request: Request, env?: any) {
  try {
    const { messages } = await request.json();

    const envObj = env || (typeof process !== "undefined" ? process.env : {});
    const rawKeys = (envObj.GROQ_API_KEYS || envObj.GROQ_API_KEY || "") as string;
    const apiKeys = rawKeys.split(",").map((k) => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      throw new Error("No API keys configured");
    }

    const groqProvider = createGroq({ apiKey: apiKeys[0] });

    const conversationText = messages
      .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const { object } = await generateObject({
      model: groqProvider("llama-3.3-70b-versatile"),
      mode: "json",
      schema: specSchema,
      prompt: `Based on the following website consultation conversation, generate a detailed website specification.

CONVERSATION:
${conversationText}

Generate a comprehensive website specification that includes all the key information discussed. For the detailedPrompt, write a thorough AI website builder prompt that a developer could use to build the exact website described.`,
    });

    // ── Save to Supabase ──────────────────────────────────────────────────────
    try {
      const supabase = getSupabaseAdmin(envObj);
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
    } catch (dbErr) {
      // Don't fail the whole request if DB save fails — just log
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
}
