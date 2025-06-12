export default async function handler(req, res) {
  try {
    const messages = req.body.messages;
    const memory = req.body.memory || [];

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid messages in request body" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OpenAI API Key in environment variables" });
    }

    const systemPrompt = `
You are OpenAssist AI, a personal assistant who is sharp, fast, emotionally intelligent, and proactive.

Your mission is to save the user time, communicate clearly, and offer polished answers that are ready to send — especially via WhatsApp, email, or SMS. 
Keep responses short, relevant, and helpful unless asked to elaborate.

When the user asks you to write a message (e.g., a WhatsApp or an email), output **only the message** with no intro. Use the user's tone and make it sound personal, confident, and direct.

Do not mention you are an AI unless explicitly asked. Always assume you're assisting in real-life tasks unless told otherwise.
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...memory,
          ...messages
        ],
        temperature: 0.7
      })
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI API error:", data);
      return res.status(500).json({ error: "OpenAI API error", detail: data });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "Oops, something went wrong.";
    res.status(200).json({ content: reply });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}
