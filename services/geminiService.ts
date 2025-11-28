import { GoogleGenAI, Type } from "@google/genai";
import { Lead, LeadCategory, LeadStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLead = async (lead: Lead): Promise<{ category: LeadCategory; analysis: string; suggestedStatus: LeadStatus }> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Analyze the following lead from a CRM system coming from WhatsApp.
      
      Lead Name: ${lead.name}
      Lead Message: "${lead.message}"
      
      Task:
      1. Categorize the lead as HOT, WARM, COLD, or FAKE/SPAM.
      2. Provide a brief 1-sentence analysis reasoning.
      3. Suggest the appropriate CRM status (NEW, CONTACTED, QUALIFIED, LOST, WON, SPAM).

      Output JSON format only.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING, enum: [LeadCategory.HOT, LeadCategory.WARM, LeadCategory.COLD, LeadCategory.FAKE] },
                analysis: { type: Type.STRING },
                suggestedStatus: { type: Type.STRING, enum: [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.SPAM] }
            },
            required: ["category", "analysis", "suggestedStatus"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    // Default fallback
    return {
        category: result.category as LeadCategory || LeadCategory.UNCATEGORIZED,
        analysis: result.analysis || "Could not analyze lead.",
        suggestedStatus: result.suggestedStatus as LeadStatus || LeadStatus.NEW
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      category: LeadCategory.UNCATEGORIZED,
      analysis: "AI Analysis unavailable.",
      suggestedStatus: LeadStatus.NEW
    };
  }
};

export const generateFollowUp = async (lead: Lead, tone: 'professional' | 'friendly' | 'urgent'): Promise<string> => {
    try {
        const model = "gemini-2.5-flash";
        const prompt = `
          Write a WhatsApp follow-up message for this lead.
          
          Name: ${lead.name}
          Initial Message: "${lead.message}"
          Current Status: ${lead.status}
          Tone: ${tone}
          
          Keep it short, engaging, and relevant to their initial inquiry. Do not include placeholders like [Your Name], sign it as "Zawo Team".
        `;
    
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
        });
    
        return response.text || "Could not generate draft.";
    
      } catch (error) {
        console.error("Gemini FollowUp Failed:", error);
        return "Error generating draft.";
      }
}
