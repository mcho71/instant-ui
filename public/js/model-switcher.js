// モデル切り替え管理
class ModelSwitcher {
    constructor() {
        this.isInitialized = false;
        this.currentModel = null;
        this.availableModels = [];
        this.performanceStats = {};
    }

    // 初期化
    async init() {
        if (this.isInitialized) return;
        
        try {
            // モデル情報を取得
            await this.loadModels();
            
            // UIを構築
            this.createUI();
            
            // パフォーマンス統計を定期更新
            this.startPerformanceUpdate();
            
            this.isInitialized = true;
            console.log('Model switcher initialized');
        } catch (error) {
            console.error('Failed to initialize model switcher:', error);
        }
    }

    // モデル情報を読み込み
    async loadModels() {
        try {
            const data = await window.aiClient.getModels();
            this.availableModels = data.available;
            this.currentModel = data.current;
            
            // パフォーマンス統計も取得
            this.performanceStats = await window.aiClient.getPerformanceStats();
        } catch (error) {
            console.error('Error loading models:', error);
            throw error;
        }
    }

    // UI構築
    createUI() {
        const container = document.getElementById('model-switcher-container');
        if (!container) {
            console.error('Model switcher container not found');
            return;
        }

        // モデル切り替えUIを作成
        container.innerHTML = `
            <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-white/80">Model:</label>
                <select id="model-selector" class="glass rounded-lg px-3 py-1 text-sm text-white bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30">
                    ${this.availableModels.map(model => `
                        <option value="${model.key}" ${model.key === this.currentModel.key ? 'selected' : ''}>
                            ${model.displayName}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div id="performance-indicator" class="flex items-center space-x-2">
                <div id="response-time" class="text-sm text-white/70">-</div>
                <button id="performance-toggle" class="text-xs text-white/60 hover:text-white/90 transition-colors">
                    📊
                </button>
            </div>
        `;

        // イベントリスナーを設定
        this.setupEventListeners();
        
        // パフォーマンス統計パネルを作成
        this.createPerformancePanel();
    }

    // イベントリスナー設定
    setupEventListeners() {
        // モデル選択
        const selector = document.getElementById('model-selector');
        if (selector) {
            selector.addEventListener('change', async (e) => {
                await this.switchModel(e.target.value);
            });
        }

        // パフォーマンス統計表示切り替え
        const toggle = document.getElementById('performance-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                this.togglePerformancePanel();
            });
        }
    }

    // モデル切り替え
    async switchModel(modelKey) {
        try {
            const data = await window.aiClient.switchModel(modelKey);
            this.currentModel = data.current;
            
            // 成功通知
            this.showNotification(`Switched to ${this.currentModel.displayName}`, 'success');
            
            // パフォーマンス統計を更新
            await this.updatePerformanceStats();
            
        } catch (error) {
            console.error('Error switching model:', error);
            this.showNotification('Failed to switch model', 'error');
        }
    }

    // パフォーマンス統計パネルを作成
    createPerformancePanel() {
        const panel = document.createElement('div');
        panel.id = 'performance-panel';
        panel.className = 'fixed top-16 right-4 glass rounded-2xl p-6 z-50 hidden';
        panel.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-white">Performance Statistics</h3>
                <button id="close-performance" class="text-white/60 hover:text-white/90">×</button>
            </div>
            <div id="performance-content" class="space-y-4">
                <!-- コンテンツは動的に生成 -->
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // 閉じるボタン
        document.getElementById('close-performance').addEventListener('click', () => {
            this.togglePerformancePanel();
        });
    }

    // パフォーマンス統計を更新
    async updatePerformanceStats() {
        try {
            this.performanceStats = await window.aiClient.getPerformanceStats();
            this.updatePerformanceDisplay();
        } catch (error) {
            console.error('Error updating performance stats:', error);
        }
    }

    // パフォーマンス表示を更新
    updatePerformanceDisplay() {
        // 現在のモデルの応答時間を表示
        const responseTimeElement = document.getElementById('response-time');
        if (responseTimeElement && this.currentModel) {
            const stats = this.performanceStats[this.currentModel.key];
            if (stats && stats.count > 0) {
                responseTimeElement.textContent = `${stats.average}ms`;
            } else {
                responseTimeElement.textContent = '-';
            }
        }

        // パフォーマンスパネルの内容を更新
        this.updatePerformancePanel();
    }

    // パフォーマンスパネルの内容を更新
    updatePerformancePanel() {
        const content = document.getElementById('performance-content');
        if (!content) return;

        const hasStats = Object.keys(this.performanceStats).some(key => 
            this.performanceStats[key].count > 0
        );

        if (!hasStats) {
            content.innerHTML = '<p class="text-white/60">No performance data available yet.</p>';
            return;
        }

        content.innerHTML = Object.keys(this.performanceStats).map(modelKey => {
            const stats = this.performanceStats[modelKey];
            const isCurrent = modelKey === this.currentModel.key;
            
            return `
                <div class="bg-white/5 rounded-lg p-4 ${isCurrent ? 'border border-white/20' : ''}">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="font-medium text-white">${stats.displayName}</h4>
                        ${isCurrent ? '<span class="text-xs text-green-400">Current</span>' : ''}
                    </div>
                    ${stats.count > 0 ? `
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="text-white/60">Average:</span>
                                <span class="text-white font-mono">${stats.average}ms</span>
                            </div>
                            <div>
                                <span class="text-white/60">Requests:</span>
                                <span class="text-white font-mono">${stats.count}</span>
                            </div>
                            <div>
                                <span class="text-white/60">Min:</span>
                                <span class="text-white font-mono">${stats.min}ms</span>
                            </div>
                            <div>
                                <span class="text-white/60">Max:</span>
                                <span class="text-white font-mono">${stats.max}ms</span>
                            </div>
                        </div>
                    ` : `
                        <p class="text-white/60 text-sm">No data available</p>
                    `}
                </div>
            `;
        }).join('');
    }

    // パフォーマンスパネルの表示切り替え
    togglePerformancePanel() {
        const panel = document.getElementById('performance-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                this.updatePerformanceStats();
            }
        }
    }

    // 定期的なパフォーマンス更新を開始
    startPerformanceUpdate() {
        // 30秒ごとに更新
        setInterval(() => {
            this.updatePerformanceStats();
        }, 30000);
    }

    // 通知表示
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-2xl shadow-2xl z-50 fade-in ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        } text-white`;
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${
                    type === 'success' ? '✅' : 
                    type === 'error' ? '❌' : 
                    'ℹ️'
                }</span>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 3秒後に削除
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // 最新のレスポンス時間を記録
    recordResponseTime(responseTime) {
        const responseTimeElement = document.getElementById('response-time');
        if (responseTimeElement) {
            responseTimeElement.textContent = `${Math.round(responseTime)}ms`;
        }
    }
}

// グローバルに公開
window.modelSwitcher = new ModelSwitcher();