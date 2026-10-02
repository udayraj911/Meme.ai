import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure GEMINI_API_KEY is configured
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment variables.");
}

// Initialize the Google GenAI SDK
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set high limits for base64 image payloads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Route: Magic Caption (Image Analysis & Suggestion)
  app.post("/api/magic-caption", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 parameter" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured. Please add it to Settings > Secrets." });
      }

      // If imageBase64 is a remote URL, fetch and convert it server-side
      let cleanBase64 = "";
      let finalMimeType = mimeType || "image/png";

      if (imageBase64.startsWith("http")) {
        const fetchRes = await fetch(imageBase64);
        const arrayBuffer = await fetchRes.arrayBuffer();
        cleanBase64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = fetchRes.headers.get("content-type");
        if (contentType) {
          finalMimeType = contentType;
        }
      } else {
        cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      }

      const imagePart = {
        inlineData: {
          mimeType: finalMimeType,
          data: cleanBase64,
        },
      };

      const promptPart = {
        text: `Analyze this image in detail (identifying expressions, body language, objects, text, setting, and humorous potential) and generate exactly 5 funny, context-aware meme caption suggestions.

Each suggestion must be creative and tailored directly to the image content. Provide a mixture of modern styles (e.g., self-deprecating humor, relatable daily life situations, sarcastic commentary, or literal descriptions).

For each caption suggestion, you must return:
1. "vibe": A descriptive category representing the style/mood of the caption (e.g., "Relatable", "Sarcastic", "Nerd Culture", "Absurd/Surreal", "Literal Humor", "Existential Dread").
2. "text": If the meme style is a single modern block caption (like a Tweet overlay).
3. "topText" and "bottomText": If the meme style fits the classic top/bottom text overlay. (Either "text" is populated, or "topText" and "bottomText" are populated, or both types are offered).
4. "explanation": A very brief, funny explanation describing why this caption fits the visual nuances of the photo.`,
      };

      // Call gemini-3.1-pro-preview as requested for image understanding / analysis
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: { parts: [imagePart, promptPart] },
        config: {
          temperature: 1.0,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              captions: {
                type: Type.ARRAY,
                description: "List of 5 unique meme caption suggestions",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    vibe: {
                      type: Type.STRING,
                      description: "Theme/vibe of this meme suggestion (e.g. Sarcastic, Relatable, Absurd)"
                    },
                    text: {
                      type: Type.STRING,
                      description: "Meme text for a single-box style modern caption (optional if topText/bottomText is set)"
                    },
                    topText: {
                      type: Type.STRING,
                      description: "Traditional top text overlay (optional)"
                    },
                    bottomText: {
                      type: Type.STRING,
                      description: "Traditional bottom text overlay (optional)"
                    },
                    explanation: {
                      type: Type.STRING,
                      description: "Why this meme works based on the photo's visual cues"
                    }
                  },
                  required: ["vibe", "explanation"]
                }
              }
            },
            required: ["captions"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini model.");
      }

      const parsed = JSON.parse(responseText.trim());
      res.json(parsed);
    } catch (error: any) {
      console.error("Error in magic-caption:", error);
      res.status(500).json({ error: error.message || "An error occurred while analyzing the image." });
    }
  });

  // API Route: Generate Meme Template (AI Image Generation)
  app.post("/api/generate-template", async (req, res) => {
    try {
      const { prompt, aspectRatio } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt parameter" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured. Please add it to Settings > Secrets." });
      }

      // Call gemini-3.1-flash-image-preview as requested for template creation
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: {
          parts: [
            {
              text: `Meme background template: ${prompt}. High quality, funny, clear details, perfect layout for adding overlay captions later. Avoid embedding any pre-existing text into the image itself.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1",
            imageSize: "1K"
          }
        }
      });

      let base64Image = "";
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!base64Image) {
        throw new Error("No image data returned from Gemini Image API.");
      }

      res.json({ imageUrl: base64Image });
    } catch (error: any) {
      console.error("Error in generate-template:", error);
      res.status(500).json({ error: error.message || "An error occurred while generating the image template." });
    }
  });

  // API Route: Edit Template (AI Image Editing)
  app.post("/api/edit-template", async (req, res) => {
    try {
      const { imageBase64, mimeType, prompt } = req.body;

      if (!imageBase64 || !prompt) {
        return res.status(400).json({ error: "Missing imageBase64 or prompt parameter" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured. Please add it to Settings > Secrets." });
      }

      // If imageBase64 is a remote URL, fetch and convert it server-side
      let cleanBase64 = "";
      let finalMimeType = mimeType || "image/png";

      if (imageBase64.startsWith("http")) {
        const fetchRes = await fetch(imageBase64);
        const arrayBuffer = await fetchRes.arrayBuffer();
        cleanBase64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = fetchRes.headers.get("content-type");
        if (contentType) {
          finalMimeType = contentType;
        }
      } else {
        cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      }

      // Call gemini-3.1-flash-image-preview as requested for template editing
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: finalMimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      let base64Image = "";
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!base64Image) {
        throw new Error("No edited image data returned from Gemini Image API.");
      }

      res.json({ imageUrl: base64Image });
    } catch (error: any) {
      console.error("Error in edit-template:", error);
      res.status(500).json({ error: error.message || "An error occurred while editing the image template." });
    }
  });

  // Vite Integration for Assets and SPA Fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
