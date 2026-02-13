import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const userMessages = req.body.messages || [];

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: userMessages
      })
    });

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat endpoint failed." });
  }
});

// Summary endpoint
app.post("/api/summary", async (req, res) => {
  try {
    const text = req.body.text || "";

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "Summarize the following text clearly and concisely." },
          { role: "user", content: text }
        ]
      })
    });

    const data = await groqRes.json();
    const summary = data?.choices?.[0]?.message?.content || "Unable to summarize.";

    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summary endpoint failed." });
  }
});

// Insights endpoint
app.post("/api/insights", async (req, res) => {
  try {
    const text = req.body.text || "";

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "Extract financial insights, tips, and key takeaways from the text." },
          { role: "user", content: text }
        ]
      })
    });

    const data = await groqRes.json();
    const insights = data?.choices?.[0]?.message?.content || "No insights available.";

    res.json({ insights });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insights endpoint failed." });
  }
});

// Start server
app.listen(3000, () => console.log("Backend running on port 3000"));
