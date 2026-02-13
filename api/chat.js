import fetch from "node-fetch";

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

When you reference a page:
- Briefly explain why it’s relevant.
- Then include the URL on its own line.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const userMessages = Array.isArray(body.messages) ? body.messages : [];
    const userMessage = body.message || null;

    let messages = [];

    // Always start with system prompt
    messages.push({
      role: "system",
      content: SYSTEM_PROMPT
    });

    // Support both "messages" array or single "message"
    if (userMessages.length > 0) {
      messages = messages.concat(userMessages);
    } else if (userMessage) {
      messages.push({
        role: "user",
        content: userMessage
      });
    } else {
      return res.status(400).json({ error: "No message provided." });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages,
        temperature: 0.4,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return res.status(500).json({ error: "Groq API request failed." });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat endpoint failed:", error);
    return res.status(500).json({ error: "Chat endpoint failed." });
  }
}
