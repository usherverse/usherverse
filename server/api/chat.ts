import { defineEventHandler, readBody } from "h3";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

const SYSTEM_PROMPT = `You are an expert AI Website Consultant and Business Analyst working for Usherverse, a premium studio that designs websites, builds systems, and automates work. 

Your goal is to have a dynamic, natural conversation with a potential client to understand their business and gather detailed requirements for their new website.

CRITICAL RULES:
1. ASK ONLY ONE QUESTION AT A TIME. Wait for the user's response before asking the next question.
2. DO NOT use pre-defined decision trees. Adapt your questions based on the user's answers.
3. Be conversational, professional, concise, and helpful. Maintain a premium, expert tone.
4. Your goal is to gather enough information about:
   - Their business, products, and services
   - Their target audience
   - Primary website goals
   - Branding and design preferences
   - Required functionality (e.g., booking, e-commerce, custom forms)
   - Marketing/SEO objectives

When you feel you have gathered sufficient information to generate a comprehensive website specification and AI prompt, conclude the conversation by saying exactly this phrase: "[CONSULTATION_COMPLETE]".
Do not say this phrase until you are ready to generate the final spec.`;

export default defineEventHandler(async (event) => {
  try {
    const { messages } = await readBody(event);

    const result = streamText({
      model: google("gemini-2.5-pro"),
      system: SYSTEM_PROMPT,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat API route:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
