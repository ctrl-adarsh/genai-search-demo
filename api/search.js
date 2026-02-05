import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is empty" });

  try {
    const result = await model.generateContent(
      `Concise search result for: ${query}`
    );
    res.status(200).json({ text: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "CONNECTION_FAILURE_AT_SOURCE" });
  }
}
