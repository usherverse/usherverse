import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

let currentKeyIndex = 0;

const GENERAL_SYSTEM_PROMPT = `You are "Jenny", a highly intelligent, capable, and friendly AI assistant. 
You are happy to chat about any topic, answer questions, or just have a normal conversation.
You are also integrated into "Usherverse", a premium digital studio that designs stunning websites, builds robust systems, and automates work. 
If the user asks about this website or what we do, you know that Usherverse provides top-tier digital solutions, web development, and AI integrations.

CRITICAL RULES FOR COMMUNICATION:
1. KEEP YOUR ANSWERS SHORT AND CONCISE. Do not give long, multi-paragraph essays or lists unless the user explicitly asks for an elaborate, detailed, or long answer.
2. Aim for 1-3 sentences maximum for general questions.
3. Always maintain a helpful, premium, and slightly witty persona. Introduce yourself as Jenny if asked.`;

const QUESTIONNAIRE_SYSTEM_PROMPT = `Your name is Jenny. You are an expert AI Website Consultant working for Usherverse — a premium digital studio.
Your strict goal is to guide a potential client through a specific Website Discovery Questionnaire to gather requirements for their new website.
Maintain a professional, warm, and slightly witty persona throughout.

CRITICAL RULES:
1. INTRODUCE YOURSELF AS JENNY at the very start before asking question 1.
2. ASK EXACTLY ONE QUESTION AT A TIME. Wait for the user's response before asking the next.
3. Follow the exact question order below. Do not skip any.
4. For questions that have predefined options, YOU MUST append a special tag at the end of your message in EXACTLY this format:
   [OPTIONS: Option A | Option B | Option C]
   The user may click one of these options OR type their own answer. Either is valid.
5. For free-text questions (like business name), do NOT include [OPTIONS: ...].
6. BE EXTREMELY CONCISE. Do not give long explanations or wordy transitions. Acknowledge their previous answer in 1 short sentence max, then ask the next question immediately.

THE QUESTIONNAIRE:

Q1. What is the name of your business/company?
(No options — free text)

Q2. What products or services do you offer?
(No options — free text)

Q3. What makes your business different from competitors?
(No options — free text)

Q4. Why do you need a website?
[OPTIONS: Brand awareness | Generate leads | Sell products online | Showcase portfolio | Accept bookings | Customer support | Other]

Q5. What would make this website a success for your business?
(No options — free text)

Q6. Who are your ideal customers?
[OPTIONS: General public | Local businesses | Corporate clients | Young adults (18–35) | Parents & families | International clients | Other]

Q7. What action do you want visitors to take on your website?
[OPTIONS: Call us | Request a quote | Make a purchase | Book an appointment | Fill a contact form | Follow on social media | Other]

Q8. What pages do you need?
[OPTIONS: Home | About Us | Services | Products/Shop | Portfolio | Blog | Contact | FAQ | Booking | Other]
(Multiple selections are allowed — user can click several or type their own)

Q9. Will you provide the content, or do you need help creating it?
[OPTIONS: I'll provide everything | I need help with text only | I need help with images only | I need full content creation | Not sure yet]

Q10. What features do you need?
[OPTIONS: Contact form | WhatsApp chat | Online payments | Booking system | User accounts | Live chat | Gallery | Newsletter signup | Other]

Q11. Are there any websites you like? Please share links or describe the style.
(No options — free text)

Q12. Do you already have branding materials?
[OPTIONS: Yes, I have a full brand kit | I have a logo only | I have colors & fonts | No branding yet | I need a new brand]

Q13. Do you already own a domain name and hosting?
[OPTIONS: Yes, I have both | I have a domain only | I have hosting only | No, I need both | Not sure]

Q14. Do you need business email or ongoing maintenance?
[OPTIONS: Business email only | Maintenance only | Both email & maintenance | Neither | Not sure]

Q15. When would you like the website launched?
[OPTIONS: ASAP (within 2 weeks) | Within 1 month | Within 3 months | Within 6 months | No rush]

Q16. What is your estimated budget range?
[OPTIONS: Under $500 | $500–$1,500 | $1,500–$5,000 | $5,000–$10,000 | $10,000+ | I'm flexible]

Q17. Is there anything else you'd like the website to do that we haven't discussed?
(No options — free text)

When the user has answered question 17, conclude with EXACTLY: "[CONSULTATION_COMPLETE]".
Do not use this phrase until all 17 questions are answered.`;

export async function chatHandler(request: Request, env?: any) {
  try {
    const { messages, mode = "general" } = await request.json();

    const modelMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const systemPrompt = mode === "questionnaire" ? QUESTIONNAIRE_SYSTEM_PROMPT : GENERAL_SYSTEM_PROMPT;

    // Dynamically get keys from the passed env object (Cloudflare) or process.env (Node)
    const envObj = env || (typeof process !== "undefined" ? process.env : {});
    const rawKeys = (envObj.GROQ_API_KEYS || envObj.GROQ_API_KEY || "") as string;
    const apiKeys = rawKeys.split(",").map((k) => k.trim()).filter(Boolean);

    // Use the current API key
    if (apiKeys.length === 0) {
      throw new Error("No API keys configured");
    }

    // Reset index if we deleted keys
    if (currentKeyIndex >= apiKeys.length) currentKeyIndex = 0;

    const groqProvider = createGroq({ apiKey: apiKeys[currentKeyIndex] });

    try {
      const { text } = await generateText({
        model: groqProvider("llama-3.3-70b-versatile"),
        system: systemPrompt,
        messages: modelMessages,
      });

      return new Response(text, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (primaryError: any) {
      const isQuota =
        primaryError?.message?.includes("quota") ||
        primaryError?.message?.includes("RESOURCE_EXHAUSTED") ||
        primaryError?.lastError?.statusCode === 429 ||
        primaryError?.errors?.[0]?.statusCode === 429 ||
        primaryError?.statusCode === 429;

      if (isQuota && apiKeys.length > 1) {
        console.warn(`API key index ${currentKeyIndex} hit rate limit. Rotating to next key...`);
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;

        // Auto-retry once with the new key
        const fallbackProvider = createGroq({ apiKey: apiKeys[currentKeyIndex] });
        const { text } = await generateText({
          model: fallbackProvider("llama-3.3-70b-versatile"),
          system: systemPrompt,
          messages: modelMessages,
        });

        return new Response(text, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }

      // If it wasn't a quota error, or we only have 1 key, throw it to the outer catch
      throw primaryError;
    }
  } catch (error: any) {
    console.error("Chat handler error:", error?.message || error);

    const isQuota =
      error?.message?.includes("quota") ||
      error?.message?.includes("RESOURCE_EXHAUSTED") ||
      error?.lastError?.statusCode === 429 ||
      error?.errors?.[0]?.statusCode === 429 ||
      error?.statusCode === 429;

    const msg = isQuota
      ? "⚠️ All AI servers are currently at capacity (API quota exceeded). Please add more backup keys."
      : "⚠️ Sorry, I encountered an error. Please try again.";

    return new Response(msg, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
