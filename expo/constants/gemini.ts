import { GoogleGenerativeAI } from "@google/generative-ai";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("Google Gemini API key not found. Please add EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY to your .env file");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export type ImageAnalysisResult = {
  caption: string;
  description: string;
  mood: string;
  suggestedTags: string[];
  relationshipMoment: string;
};

export async function analyzeImage(imageUri: string): Promise<ImageAnalysisResult> {
  try {
    console.log("Starting image analysis for:", imageUri);

    const base64Image = await convertImageToBase64(imageUri);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this photo that was uploaded by a couple to their relationship app. Provide:
1. A short romantic caption (max 50 characters)
2. A detailed description of what's in the image
3. The mood/emotion of the scene (e.g., romantic, playful, intimate, adventurous)
4. 3-5 relevant tags
5. What type of relationship moment this captures (e.g., "Date night", "Adventure together", "Cozy moment")

Return the response in the following JSON format:
{
  "caption": "Short romantic caption",
  "description": "Detailed description",
  "mood": "emotion/mood",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "relationshipMoment": "Type of moment"
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    console.log("Gemini response:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }

    return {
      caption: "Beautiful memory",
      description: text,
      mood: "happy",
      suggestedTags: [],
      relationshipMoment: "Special moment",
    };
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
}

async function convertImageToBase64(imageUri: string): Promise<string> {
  try {
    console.log("Converting image to base64:", imageUri);

    if (imageUri.startsWith("data:")) {
      const base64Data = imageUri.split(",")[1];
      return base64Data;
    }

    if (imageUri.startsWith("http://") || imageUri.startsWith("https://")) {
      if (Platform.OS === "web") {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: "base64",
        });
        console.log("Image converted to base64");
        return base64;
      }
    }

    if (imageUri.startsWith("file://")) {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64",
      });
      console.log("Image converted to base64");
      return base64;
    }

    if (imageUri.startsWith("/") || !imageUri.includes("://")) {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64",
      });
      console.log("Image converted to base64");
      return base64;
    }

    throw new Error("Unsupported image URI format: " + imageUri);
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
}

export async function scanMemoryForInsights(imageUri: string): Promise<string> {
  try {
    console.log("Scanning memory for insights:", imageUri);

    const base64Image = await convertImageToBase64(imageUri);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `This is a photo from a couple's relationship app. Analyze it and provide:
- What activity or moment is captured
- The emotional tone and connection visible
- Any meaningful details that make this moment special
- A suggestion for how they could commemorate or build on this memory

Keep it warm, personal, and encouraging. Write 2-3 sentences.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    console.log("Memory insight:", text);

    return text;
  } catch (error) {
    console.error("Error scanning memory:", error);
    throw new Error("Failed to analyze memory. Please try again.");
  }
}
