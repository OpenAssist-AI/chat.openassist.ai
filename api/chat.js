export default async function handler(req, res) {
  const messages = req.body.messages;

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Missing OpenAI API key");
    return res.status(500).json({ error: "Missing OpenAI API key" });
  }

  if (!messages || !Array.isArray(messages)) {
    console.warn("⚠️ Invalid request body format");
    return res.status(400).json({ error: "Invalid request format. Expected an array of messages." });
  }

  try {
    console.log("➡️ Sending request to OpenAI with messages:", messages);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API error (${response.status}):`, errorText);
      return res.status(500).json({ error: "OpenAI API error", details: errorText });
    }

    const data = await response.json();
    console.log("✅ OpenAI response:", data);

    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    res.status(500).json({ error: "Unexpected server error", details: err.message });
  }
}
