export default async function handler(req, res) {
  try {
    const messages = req.body.messages;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid messages in request body" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OpenAI API Key in environment variables" });
    }

    const systemPrompt = {
      role: "system",
      content: `You are OpenAssist AI, a smart assistant that writes sharp, clear, and emotionally intelligent replies. 
Always reply in a ready-to-send format, especially for WhatsApp or email—no introductions or explanations, just the message the user would send.
If the user mentions 'write a WhatsApp' or 'send an email', return only the message itself, as if the user will copy-paste it.`
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [systemPrompt, ...messages],
        temperature: 0.7
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.status(500).json({ error: "OpenAI API error", detail: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}
