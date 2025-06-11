export default async function handler(req, res) {
  console.log("🔵 Incoming request body:", req.body);

  try {
    if (req.method !== "POST") {
      console.warn("⚠️ Invalid method:", req.method);
      return res.status(405).json({ error: "Method not allowed" });
    }

    const messages = req.body.messages;
    if (!messages) {
      console.warn("⚠️ No messages in body!");
      return res.status(400).json({ error: "Missing messages in request body" });
    }

    console.log("➡️ Sending to OpenAI:", messages);

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages
      })
    });

    console.log("OpenAI responded, status:", apiRes.status);

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("❌ OpenAI error:", errText);
      return res.status(500).json({ error: "OpenAI API error", detail: errText });
    }

    const data = await apiRes.json();
    console.log("✅ OpenAI reply data:", data);

    return res.status(200).json(data);
  } catch (err) {
    console.error("💥 Unexpected error in handler:", err);
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}
