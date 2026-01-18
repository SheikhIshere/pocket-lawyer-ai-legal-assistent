import { GoogleGenAI } from "@google/genai";

// Initialize the client
// In a real app, ensure process.env.API_KEY is set.
// For this prototype, we will simulate the behavior if no key is present.
const apiKey = process.env.API_KEY || "dummy_key";
const ai = new GoogleGenAI({ apiKey });

export const generateLegalAdvice = async (prompt: string): Promise<string> => {
  try {
    if (apiKey === "dummy_key") {
      // Simulate network delay for prototype
      await new Promise(resolve => setTimeout(resolve, 1500));
      return "This is a simulated AI response. To get real legal advice, please configure a valid Gemini API Key. \n\nHowever, generally speaking, regarding your query about " + prompt.substring(0, 20) + "... [Detailed legal information would appear here].";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are Pocket Lawyer, a helpful legal AI assistant. Provide clear, non-binding legal information. Always include a disclaimer.",
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, but I'm having trouble connecting to the legal database right now. Please try again later.";
  }
};