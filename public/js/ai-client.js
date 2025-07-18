// AI クライアント
class AIClient {
    constructor() {
        this.baseUrl = '';
    }

    // UIの生成をリクエスト
    async generateUI(appType, context = {}) {
        try {
            const response = await fetch('/api/generate-ui', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    appType: appType,
                    context: context
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

}

// グローバルに公開
window.aiClient = new AIClient();