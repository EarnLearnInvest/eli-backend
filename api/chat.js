import Groq from "groq-sdk";

export const config = {
  runtime: "edge",
};

const SYSTEM_PROMPT = `
You are the EarnLearnInvest Assistant — a friendly, concise financial guide.
`;

function cors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, { ...response, headers });
}

export default async function handler(req) {
  // Preflight
  if (req.method === "OPTIONS") {
    return cors(new Response(null, { status: 204 }));
  }

  if (req.method !== "POST") {
    return cors(
      new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
      })
    );
  }

  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return cors(
        new Response(JSON.stringify({ error: "No message provided." }), {
          status: 400,
        })
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

    return cors(
      new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch (err) {
    return cors(
      new Response(JSON.stringify({ error: "Chat endpoint failed." }), {
        status: 500,
      })
    );
  }
}
