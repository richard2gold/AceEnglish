/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { LessonContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateLessonContent(id: number, topic: string): Promise<LessonContent> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a comprehensive English learning lesson for a Chinese intermediate student aiming for advanced level. 
    Topic: ${topic}
    Include:
    1. A formal news-style article in English (around 500 words).
    2. A natural Chinese translation.
    3. 8-10 advanced vocabulary words with phonetics, meanings (in Chinese), and example sentences.
    4. 3 complex sentences analyzed for grammar features (in Chinese).
    5. 10 practice questions (mix of multiple choice and fill-in-the-blank) with explanations (in Chinese).
    Output must be strictly JSON format corresponding to LessonContent interface.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.NUMBER },
          title: { type: Type.STRING },
          topic: { type: Type.STRING },
          contentEn: { type: Type.STRING },
          contentCn: { type: Type.STRING },
          vocabulary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                phonetic: { type: Type.STRING },
                meaning: { type: Type.STRING },
                example: { type: Type.STRING }
              },
              required: ["word", "phonetic", "meaning", "example"]
            }
          },
          analysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                translation: { type: Type.STRING },
                analysis: { type: Type.STRING }
              },
              required: ["original", "translation", "analysis"]
            }
          },
          practice: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["multiple-choice", "fill-in-blank"] }
              },
              required: ["id", "question", "answer", "explanation", "type"]
            }
          }
        },
        required: ["id", "title", "topic", "contentEn", "contentCn", "vocabulary", "analysis", "practice"]
      }
    }
  });

  const content = JSON.parse(response.text || "{}");
  return { ...content, id, topic };
}
