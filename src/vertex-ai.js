const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

class VertexAIClient {
  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!this.apiKey) {
      console.warn("Google AI API key not configured");
    }

    // Initialize Google Generative AI
    this.genAI = new GoogleGenAI({ 
      vertexai: false, 
      apiKey: this.apiKey 
    });

    // JSON response schema for UI generation
    this.responseSchema = {
      type: "object",
      properties: {
        html: {
          type: "string",
          description: "Complete HTML code using Tailwind CSS classes",
        },
        script: {
          type: "string",
          description: "Initialization JavaScript code",
        },
        styles: {
          type: "string",
          description: "Additional CSS if needed (usually empty)",
        },
        metadata: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Application title",
            },
            defaultSize: {
              type: "object",
              properties: {
                width: {
                  type: "integer",
                  description: "Default window width",
                },
                height: {
                  type: "integer",
                  description: "Default window height",
                },
              },
              required: ["width", "height"],
            },
          },
          required: ["title", "defaultSize"],
        },
      },
      required: ["html", "script", "styles", "metadata"],
    };
  }

  // プロンプトファイルを読み込み
  loadPrompt(promptPath) {
    try {
      const fullPath = path.join(__dirname, "..", "prompts", promptPath);
      return fs.readFileSync(fullPath, "utf-8");
    } catch (error) {
      console.error("Error loading prompt:", error);
      return "";
    }
  }

  // システムプロンプトとアプリプロンプトを結合
  buildPrompt(appType, context = {}) {
    const systemPrompt = this.loadPrompt("system.txt");
    const appPrompt = this.loadPrompt(`apps/${appType}.txt`);

    let fullPrompt = systemPrompt + "\\n\\n" + appPrompt;

    // コンテキストを挿入
    if (context.appName) {
      fullPrompt = fullPrompt.replace("{APP_NAME}", context.appName);
    }

    return fullPrompt;
  }

  // Gemini Flash Liteにリクエスト（Google AI SDK使用）
  async generateUI(appType, context = {}) {
    if (!this.apiKey) {
      throw new Error("Google AI API key not configured");
    }

    const prompt = this.buildPrompt(appType, context);

    try {
      console.log("Sending request to Google AI...");
      console.log("Model:", "gemini-2.5-flash-lite-preview-06-17");

      const result = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash-lite-preview-06-17",
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: 4096,
          topP: 0.8,
          topK: 40,
          responseMimeType: "application/json",
          responseSchema: this.responseSchema,
        },
      });

      console.log("Response received from Google AI");
      console.log("Response type:", typeof result);
      console.log("Response keys:", Object.keys(result));

      if (!result.text) {
        throw new Error("No text in response");
      }

      const content = result.text;

      console.log("Raw response content:", content);
      console.log("Content type:", typeof content);
      console.log("Content length:", content.length);

      // With structured output, the response should already be valid JSON
      try {
        const parsed = JSON.parse(content);
        console.log("Successfully parsed JSON:", parsed);
        return parsed;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Raw content that failed to parse:", content);
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }
    } catch (error) {
      console.error("Google AI Error:", error);
      throw error;
    }
  }

  // ヘルスチェック
  async healthCheck() {
    try {
      await this.generateUI("calculator", { test: true });
      return true;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }
}

module.exports = VertexAIClient;