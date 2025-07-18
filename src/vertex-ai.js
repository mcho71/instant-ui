const { PredictionServiceClient } = require('@google-cloud/aiplatform');
const fs = require('fs');
const path = require('path');

class VertexAIClient {
    constructor() {
        this.projectId = process.env.VERTEX_AI_PROJECT_ID;
        this.location = process.env.VERTEX_AI_LOCATION || 'asia-northeast1';
        this.accessToken = process.env.VERTEX_AI_ACCESS_TOKEN;
        
        if (!this.projectId || !this.accessToken) {
            console.warn('Vertex AI credentials not configured properly');
        }
        
        // REST APIを使用（アクセストークン認証）
        this.endpoint = `https://${this.location}-aiplatform.googleapis.com`;
    }

    // プロンプトファイルを読み込み
    loadPrompt(promptPath) {
        try {
            const fullPath = path.join(__dirname, '..', 'prompts', promptPath);
            return fs.readFileSync(fullPath, 'utf-8');
        } catch (error) {
            console.error('Error loading prompt:', error);
            return '';
        }
    }

    // システムプロンプトとアプリプロンプトを結合
    buildPrompt(appType, context = {}) {
        const systemPrompt = this.loadPrompt('system.txt');
        const appPrompt = this.loadPrompt(`apps/${appType}.txt`);
        
        let fullPrompt = systemPrompt + '\\n\\n' + appPrompt;
        
        // コンテキストを挿入
        if (context.appName) {
            fullPrompt = fullPrompt.replace('{APP_NAME}', context.appName);
        }
        
        return fullPrompt;
    }

    // Gemini Flash Liteにリクエスト
    async generateUI(appType, context = {}) {
        if (!this.projectId || !this.accessToken) {
            throw new Error('Vertex AI credentials not configured');
        }

        const prompt = this.buildPrompt(appType, context);
        
        const requestBody = {
            instances: [{
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            }],
            parameters: {
                temperature: 0.1,
                maxOutputTokens: 2048,
                topP: 0.8,
                topK: 40
            }
        };

        try {
            const url = `${this.endpoint}/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/gemini-1.5-flash:predict`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Vertex AI API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            if (!data.predictions || data.predictions.length === 0) {
                throw new Error('No predictions in response');
            }

            const content = data.predictions[0].candidates[0].content;
            return this.parseResponse(content);
            
        } catch (error) {
            console.error('Vertex AI Error:', error);
            throw error;
        }
    }

    // レスポンスをパース
    parseResponse(content) {
        try {
            // JSONブロックを抽出
            const jsonMatch = content.match(/```json\\s*([\\s\\S]*?)\\s*```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1]);
            }
            
            // 直接JSONの場合
            if (content.trim().startsWith('{')) {
                return JSON.parse(content);
            }
            
            // パースできない場合はエラー
            throw new Error('Could not parse AI response as JSON');
            
        } catch (error) {
            console.error('Error parsing AI response:', error);
            console.error('Raw content:', content);
            throw new Error('Failed to parse AI response: ' + error.message);
        }
    }

    // ヘルスチェック
    async healthCheck() {
        try {
            await this.generateUI('calculator', { test: true });
            return true;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
}

module.exports = VertexAIClient;