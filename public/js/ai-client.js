// AI クライアント
class AIClient {
    constructor() {
        this.baseUrl = '';
        this.currentModel = null;
        this.availableModels = [];
        this.performanceStats = {};
    }

    // モデル情報を取得
    async getModels() {
        try {
            const response = await fetch('/api/models');
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to get models');
            }
            
            this.availableModels = data.data.available;
            this.currentModel = data.data.current;
            
            return data.data;
        } catch (error) {
            console.error('Error getting models:', error);
            throw error;
        }
    }

    // モデルを切り替え
    async switchModel(modelKey) {
        try {
            const response = await fetch('/api/models/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ model: modelKey })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to switch model');
            }
            
            this.currentModel = data.data.current;
            
            return data.data;
        } catch (error) {
            console.error('Error switching model:', error);
            throw error;
        }
    }

    // パフォーマンス統計を取得
    async getPerformanceStats() {
        try {
            const response = await fetch('/api/performance');
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to get performance stats');
            }
            
            this.performanceStats = data.data;
            
            return data.data;
        } catch (error) {
            console.error('Error getting performance stats:', error);
            throw error;
        }
    }

    // UIの生成をリクエスト
    async generateUI(appType, context = {}, modelKey = null) {
        try {
            const response = await fetch('/api/generate-ui', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    appType: appType,
                    context: context,
                    model: modelKey
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown error occurred');
            }

            return data.data;
            
        } catch (error) {
            console.error('AI Client Error:', error);
            throw error;
        }
    }

    // 現在のモデル情報を取得
    getCurrentModel() {
        return this.currentModel;
    }

    // 利用可能なモデル一覧を取得
    getAvailableModels() {
        return this.availableModels;
    }

}

// グローバルに公開
window.aiClient = new AIClient();