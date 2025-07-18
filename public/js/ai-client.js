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

    // エラーハンドリング付きの生成
    async generateUIWithFallback(appType, context = {}) {
        try {
            return await this.generateUI(appType, context);
        } catch (error) {
            console.warn('AI generation failed, using fallback UI:', error);
            return this.getFallbackUI(appType);
        }
    }

    // フォールバックUI
    getFallbackUI(appType) {
        const fallbacks = {
            calculator: {
                html: `
                    <div class="p-4">
                        <div class="text-center text-gray-600">
                            <p class="mb-4">AI生成に失敗しました</p>
                            <p class="text-sm">電卓アプリのフォールバック表示</p>
                        </div>
                    </div>
                `,
                script: '',
                styles: '',
                metadata: {
                    title: '電卓',
                    defaultSize: { width: 300, height: 400 }
                }
            },
            notepad: {
                html: `
                    <div class="p-4">
                        <textarea class="w-full h-64 p-2 border rounded" placeholder="メモを入力してください..."></textarea>
                    </div>
                `,
                script: '',
                styles: '',
                metadata: {
                    title: 'メモ帳',
                    defaultSize: { width: 400, height: 300 }
                }
            },
            clock: {
                html: `
                    <div class="p-4 text-center">
                        <div id="clock-display" class="text-4xl font-mono"></div>
                    </div>
                `,
                script: `
                    function updateClock() {
                        const now = new Date();
                        const display = windowContent.querySelector('#clock-display');
                        display.textContent = now.toLocaleTimeString('ja-JP');
                    }
                    updateClock();
                    setInterval(updateClock, 1000);
                `,
                styles: '',
                metadata: {
                    title: '時計',
                    defaultSize: { width: 300, height: 200 }
                }
            }
        };

        return fallbacks[appType] || {
            html: '<div class="p-4">このアプリは準備中です</div>',
            script: '',
            styles: '',
            metadata: {
                title: 'アプリ',
                defaultSize: { width: 300, height: 200 }
            }
        };
    }
}

// グローバルに公開
window.aiClient = new AIClient();