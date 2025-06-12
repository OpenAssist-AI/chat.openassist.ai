// /api/chat.js
export default async function handler(req, res) {
  try {
    const { messages, memory } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'messages' array in request body" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OpenAI API key" });
    }

    const systemPrompt = `
You are OpenAssist AI, a personal assistant that is sharp, fast, emotionally intelligent, and proactive.

Your job is to:
• Save time for the user
• Write polished, human-sounding WhatsApp and email messages directly, with no preambles
• Respond briefly unless asked to elaborate
• Remember context from earlier in the chat (simulate memory from prior messages)
• Never say "Here's your message"—just give the message.
• Sound confident, natural, and warm

Examples:
- If user says "write a WhatsApp to Julia about dinner tonight", just return:
"Hey Julia! Still up for dinner tonight? Let me know what time works best for you 😊"

- If asked to write an email to a colleague:
"Hi Thomas, just a quick note to confirm our meeting for Friday at 11AM. Let me know if anything changes."

Be bold, write naturally, and make the user sound great.
`;

    const payload = {
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...(memory || []),
        ...messages
      ],
      temperature: 0.9
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API Error:", data);
      return res.status(500).json({ error: "OpenAI API error", detail: data });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    const updatedMemory = [...(memory || []), ...messages, {
      role: "assistant",
      content: reply
    }];

    return res.status(200).json({ reply, memory: updatedMemory });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}
