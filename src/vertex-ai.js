const { PredictionServiceClient } = require('@google-cloud/aiplatform');
const fs = require('fs');
const path = require('path');

class VertexAIClient {
    constructor() {
        this.projectId = process.env.VERTEX_AI_PROJECT_ID;
        this.location = process.env.VERTEX_AI_LOCATION || 'us-central1';
        this.accessToken = process.env.VERTEX_AI_ACCESS_TOKEN;
        
        if (!this.projectId || !this.accessToken) {
            console.warn('Vertex AI credentials not configured properly');
        }
        
        // Gemini 2.5 Flash-Liteはグローバルエンドポイントのみ
        this.endpoint = `https://aiplatform.googleapis.com`;
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
            contents: [{
                role: "user",
                parts: [{
                    text: prompt
                }]
            }],
            generation_config: {
                temperature: 0.1,
                max_output_tokens: 4096,
                top_p: 0.8,
                top_k: 40
            }
        };

        try {
            const url = `${this.endpoint}/v1/projects/${this.projectId}/locations/global/publishers/google/models/gemini-2.5-flash-lite-preview-06-17:generateContent`;
            
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
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No candidates in response');
            }

            const content = data.candidates[0].content.parts[0].text;
            return this.parseResponse(content);
            
        } catch (error) {
            console.error('Vertex AI Error:', error);
            throw error;
        }
    }

    // レスポンスをパース（純粋なJSON文字列前提）
    parseResponse(content) {
        try {
            // レスポンスは直接JSON文字列として返される前提
            const trimmedContent = content.trim();
            
            // 部分的なJSONの場合（トークン制限で切れた場合）の修復を試行
            if (!this.isValidJSON(trimmedContent)) {
                const repairedJson = this.repairPartialJson(trimmedContent);
                return JSON.parse(repairedJson);
            }
            
            return JSON.parse(trimmedContent);
            
        } catch (error) {
            console.error('Error parsing AI response:', error);
            console.error('Raw content:', content);
            throw new Error('Failed to parse AI response: ' + error.message);
        }
    }

    // JSONの妥当性チェック
    isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    // 部分的なJSONを修復
    repairPartialJson(partialJson) {
        try {
            let repaired = partialJson;
            
            // 最後の不完全な行を削除
            const lines = repaired.split('\\n');
            let lastLine = lines[lines.length - 1];
            
            // 最後の行が不完全な場合は削除または修復
            while (lines.length > 0 && lastLine && 
                   !lastLine.trim().endsWith('"') && 
                   !lastLine.trim().endsWith(',') && 
                   !lastLine.trim().endsWith('}') &&
                   !lastLine.trim().endsWith(']')) {
                lines.pop();
                lastLine = lines.length > 0 ? lines[lines.length - 1] : '';
            }
            
            repaired = lines.join('\\n');
            
            // 不完全な文字列プロパティを修正
            repaired = repaired.replace(/,\\s*$/, ''); // 末尾のカンマ削除
            
            // 最後の閉じ括弧を確認・追加
            const openBraces = (repaired.match(/\\{/g) || []).length;
            const closeBraces = (repaired.match(/\\}/g) || []).length;
            
            if (openBraces > closeBraces) {
                repaired += '\\n}';
            }
            
            return repaired;
        } catch (error) {
            console.error('Could not repair partial JSON:', error);
            throw error;
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