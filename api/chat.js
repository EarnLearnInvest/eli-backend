import Groq from "groq-sdk";

export const config = {
  runtime: "edge",
};

const SYSTEM_PROMPT = `
You are the EarnLearnInvest Assistant — a friendly, concise financial guide for the EarnLearnInvest brand.

Your goals:
- Help users understand money, investing, budgeting, and wealth-building in simple, clear language.
- When helpful, guide users to specific pages on the EarnLearnInvest website.
- Keep answers short, clear, and practical.
- Ask a clarifying question if the user seems unsure.
- Always be honest about what you can and cannot do.

Key site areas you can reference:
- Guidance Tools & Calculators:
  https://earnlearninvest.com/guidance-tools-and-calculators-for-clearer-financial-understanding/
- Learn:
  https://earnlearninvest.com/learn/
- Earn:
  https://earnlearninvest.com/earn/
- Invest:
  https://earnlearninvest.com/invest/
- Contact Us:
  https://earnlearninvest.com/contact-us/
`;

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return new Response(JSON.stringify({ error: "No message provided." }), {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Initialize Groq client
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // WORKING MODEL — this is the key fix
    const completion = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ],
      temperature: 0.4,
      max_tokens: 600,
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (err) {
    console.error("Chat endpoint failed:", err);
    return new Response(JSON.stringify({ error: "Chat endpoint failed." }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}
