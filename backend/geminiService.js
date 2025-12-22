import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function speechToText(base64Audio, targetLanguage) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: `Transcribe in ${targetLanguage}` },
        { inlineData: { mimeType: "audio/webm", data: base64Audio } },
      ],
    },
  });

  return response.text?.trim() || "";
}
