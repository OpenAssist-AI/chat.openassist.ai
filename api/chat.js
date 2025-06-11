export default async function handler(req, res) {
  try {
    const messages = req.body.messages;

    if (!messages) {
      return res.status(400).json({ error: "Missing messages in request body" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing OpenAI API Key" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: "OpenAI API error", detail: data });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}
