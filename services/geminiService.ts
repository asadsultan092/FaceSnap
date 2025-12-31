
import { GoogleGenAI, Type } from "@google/genai";
import { BoundingBox } from "../types";

export const detectFacesWithAI = async (base64Image: string): Promise<BoundingBox | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: "Detect the most prominent human face in this image. Return the normalized bounding box coordinates as [ymin, xmin, ymax, xmax]. If no face is found, return null.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            box: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "[ymin, xmin, ymax, xmax] normalized 0-1000",
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text);
    if (data && data.box) {
      const [ymin, xmin, ymax, xmax] = data.box;
      return {
        x: xmin / 1000,
        y: ymin / 1000,
        width: (xmax - xmin) / 1000,
        height: (ymax - ymin) / 1000,
      };
    }
  } catch (error) {
    console.error("AI Face Detection Failed:", error);
  }
  return null;
};
