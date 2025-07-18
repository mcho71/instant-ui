const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

class VertexAIClient {
  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY;
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT;

    if (!this.apiKey) {
      console.warn("Google AI API key not configured");
    }

    if (!this.projectId) {
      console.warn("Google Cloud Project ID not configured");
    }

    // Available models configuration
    this.models = {
      'gemini-2.5-flash-lite': {
        name: 'gemini-2.5-flash-lite-preview-06-17',
        displayName: 'Gemini 2.5 Flash-Lite',
        description: 'Current model (v2.5) - Global endpoint',
        endpoint: 'global',
        useGlobalEndpoint: true
      },
      'gemini-2.0-flash-lite': {
        name: 'gemini-2.0-flash-lite',
        displayName: 'Gemini 2.0 Flash-Lite',
        description: 'Previous model (v2.0) - Regional endpoint',
        endpoint: 'us-west1',
        useGlobalEndpoint: false
      }
    };

    // Default model
    this.currentModel = 'gemini-2.5-flash-lite';

    // Performance tracking
    this.performanceStats = {
      'gemini-2.5-flash-lite': [],
      'gemini-2.0-flash-lite': []
    };

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

  // Set current model
  setModel(modelKey) {
    if (!this.models[modelKey]) {
      throw new Error(`Unknown model: ${modelKey}`);
    }
    this.currentModel = modelKey;
    console.log(`Switched to model: ${this.models[modelKey].displayName}`);
  }

  // Get current model info
  getCurrentModel() {
    return {
      key: this.currentModel,
      ...this.models[this.currentModel]
    };
  }

  // Get all available models
  getAvailableModels() {
    return Object.keys(this.models).map(key => ({
      key,
      ...this.models[key]
    }));
  }

  // Get performance statistics
  getPerformanceStats() {
    const stats = {};
    
    Object.keys(this.performanceStats).forEach(modelKey => {
      const times = this.performanceStats[modelKey];
      if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);
        
        stats[modelKey] = {
          count: times.length,
          average: Math.round(avg),
          min: Math.round(min),
          max: Math.round(max),
          displayName: this.models[modelKey].displayName
        };
      } else {
        stats[modelKey] = {
          count: 0,
          average: 0,
          min: 0,
          max: 0,
          displayName: this.models[modelKey].displayName
        };
      }
    });
    
    return stats;
  }

  // Gemini Flash Liteにリクエスト（Google AI SDK使用）
  async generateUI(appType, context = {}, modelKey = null) {
    if (!this.apiKey) {
      throw new Error("Google AI API key not configured");
    }

    // Use specified model or current model
    const targetModel = modelKey || this.currentModel;
    const modelConfig = this.models[targetModel];
    
    if (!modelConfig) {
      throw new Error(`Unknown model: ${targetModel}`);
    }

    const prompt = this.buildPrompt(appType, context);
    const startTime = Date.now();

    try {
      console.log("Sending request to Google AI...");
      console.log("Model:", modelConfig.displayName, `(${modelConfig.name})`);
      console.log("Endpoint:", modelConfig.useGlobalEndpoint ? 'Global' : `Regional (${modelConfig.endpoint})`);

      // Configure GenAI instance based on model requirements
      let genAI;
      if (modelConfig.useGlobalEndpoint) {
        // Use global endpoint for 2.5 Flash-Lite (Gemini API)
        genAI = new GoogleGenAI({ 
          vertexai: false, 
          apiKey: this.apiKey 
        });
      } else {
        // Use regional endpoint for 2.0 Flash-Lite (Vertex AI)
        if (!this.projectId) {
          throw new Error("Google Cloud Project ID is required for regional endpoints");
        }
        genAI = new GoogleGenAI({ 
          vertexai: true, 
          project: this.projectId,
          location: modelConfig.endpoint
        });
      }

      const result = await genAI.models.generateContent({
        model: modelConfig.name,
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

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Record performance
      this.performanceStats[targetModel].push(responseTime);
      
      // Keep only last 50 records per model
      if (this.performanceStats[targetModel].length > 50) {
        this.performanceStats[targetModel].shift();
      }

      console.log("Response received from Google AI");
      console.log("Response time:", responseTime, "ms");
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
        
        // Add performance metadata
        const responseWithMetrics = {
          ...parsed,
          _performance: {
            model: targetModel,
            modelDisplayName: modelConfig.displayName,
            responseTime: responseTime,
            timestamp: new Date().toISOString()
          }
        };
        
        return responseWithMetrics;
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