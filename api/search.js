import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure your Vercel Project Settings have GEMINI_KEY (no VITE_ prefix)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { query } = req.body;
  if (!query || query.trim().length < 2) {
    return res
      .status(200)
      .json({ text: ">> SYSTEM_STANDBY: AWAITING_SUFFICIENT_DATA_INPUT..." });
  }

  try {
    const prompt = `
      ROLE: High-Tech Intel Assistant. 
      TONE: Professional, concise, "hacker" style (use caps for emphasis, short sentences).
      TASK: The user is entering a search query. It may be incomplete. 
      1. If the query is partial (e.g., "what is pyth"), interpret the intent ("What is Python") and answer it.
      2. Provide a factual, helpful answer. Do NOT act like a command line (don't say 'command not found').
      3. If the query is total nonsense, say: ">> SIGNAL_NOISE_DETECTED: UNABLE_TO_EXTRACT_INTENT."
      
      USER_QUERY: "${query}"
      RESPONSE:
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res
      .status(200)
      .json({ text: text || ">> ERROR: ZERO_BYTE_RESPONSE_RECEIVED" });
  } catch (error) {
    console.error("API_ERROR:", error);
    // This catches the 500 error and sends a cleaner message back to your UI
    res.status(200).json({
      text: ">> CRITICAL_FAILURE: API_KEY_INVALID_OR_SERVICE_OVERLOADED",
    });
  }
}
