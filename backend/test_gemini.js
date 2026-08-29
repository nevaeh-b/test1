import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function testGemini() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "서울에서 하루 동안 여행할 수 있는 코스를 추천해줘.",
  });

  console.log(response.text);
}

testGemini();