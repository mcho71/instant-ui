// キャッシュ管理UI
class CacheManager {
    constructor() {
        this.isInitialized = false;
        this.panelVisible = false;
        this.cacheStats = {};
    }

    // 初期化
    async init() {
        if (this.isInitialized) return;
        
        try {
            // キャッシュ統計を取得
            await this.updateCacheStats();
            
            // キャッシュ管理パネルを作成
            this.createCachePanel();
            
            this.isInitialized = true;
            console.log('Cache manager initialized');
        } catch (error) {
            console.error('Failed to initialize cache manager:', error);
        }
    }

    // キャッシュ統計を更新
    async updateCacheStats() {
        try {
            if (window.uiCacheManager) {
                this.cacheStats = window.uiCacheManager.getCacheStats();
            }
        } catch (error) {
            console.error('Error updating cache stats:', error);
        }
    }

    // キャッシュ管理パネルを作成
    createCachePanel() {
        const panel = document.createElement('div');
        panel.id = 'cache-panel';
        panel.className = 'fixed top-16 right-4 w-96 glass rounded-2xl p-6 z-50 hidden';
        panel.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-white">キャッシュ管理</h3>
                <button id="close-cache-panel" class="text-white/60 hover:text-white/90 transition-colors">
                    ×
                </button>
            </div>
            <div id="cache-content" class="space-y-4">
                <!-- コンテンツは動的に生成 -->
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // 閉じるボタン
        document.getElementById('close-cache-panel').addEventListener('click', () => {
            this.togglePanel();
        });
        
        // 初期表示を更新
        this.updatePanelContent();
    }

    // パネルの表示/非表示を切り替え
    togglePanel() {
        const panel = document.getElementById('cache-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            this.panelVisible = !panel.classList.contains('hidden');
            
            if (this.panelVisible) {
                // 表示時に最新の統計を取得
                this.updateCacheStats();
                this.updatePanelContent();
            }
        }
    }

    // パネルの内容を更新
    updatePanelContent() {
        const content = document.getElementById('cache-content');
        if (!content) return;

        // 統計情報を表示
        const statsSection = this.createStatsSection();
        const appsSection = this.createAppsSection();
        const actionsSection = this.createActionsSection();
        
        content.innerHTML = `
            ${statsSection}
            ${appsSection}
            ${actionsSection}
        `;
        
        // イベントリスナーを設定
        this.setupEventListeners();
    }

    // 統計情報セクションを作成
    createStatsSection() {
        const stats = this.cacheStats;
        
        if (!stats || stats.total_apps === 0) {
            return `
                <div class="bg-white/5 rounded-lg p-4">
                    <h4 class="font-medium text-white mb-2">キャッシュ統計</h4>
                    <p class="text-white/60 text-sm">キャッシュされたアプリはありません</p>
                </div>
            `;
        }

        return `
            <div class="bg-white/5 rounded-lg p-4">
                <h4 class="font-medium text-white mb-2">キャッシュ統計</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-white/60">アプリ数:</span>
                        <span class="text-white font-mono">${stats.total_apps}</span>
                    </div>
                    <div>
                        <span class="text-white/60">合計サイズ:</span>
                        <span class="text-white font-mono">${stats.total_size_kb}KB</span>
                    </div>
                    <div>
                        <span class="text-white/60">最古:</span>
                        <span class="text-white font-mono text-xs">${stats.oldest_cache ? this.formatDate(stats.oldest_cache.cached_at) : 'N/A'}</span>
                    </div>
                    <div>
                        <span class="text-white/60">最新:</span>
                        <span class="text-white font-mono text-xs">${stats.newest_cache ? this.formatDate(stats.newest_cache.cached_at) : 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // アプリ一覧セクションを作成
    createAppsSection() {
        const stats = this.cacheStats;
        
        if (!stats || stats.total_apps === 0) {
            return '';
        }

        const appsHtml = Object.keys(stats.apps).map(appId => {
            const appStats = stats.apps[appId];
            const appName = this.getAppName(appId);
            
            return `
                <div class="bg-white/5 rounded-lg p-3">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h5 class="font-medium text-white">${appName}</h5>
                            <p class="text-xs text-white/60">${appStats.model_used}</p>
                        </div>
                        <button 
                            class="clear-app-cache text-red-400 hover:text-red-300 transition-colors text-xs"
                            data-app-id="${appId}"
                            title="キャッシュを削除"
                        >
                            🗑️
                        </button>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span class="text-white/60">サイズ:</span>
                            <span class="text-white font-mono">${appStats.size_kb}KB</span>
                        </div>
                        <div>
                            <span class="text-white/60">経過:</span>
                            <span class="text-white font-mono">${appStats.age_minutes}分</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="space-y-2">
                <h4 class="font-medium text-white">キャッシュ済みアプリ</h4>
                <div class="max-h-64 overflow-y-auto space-y-2">
                    ${appsHtml}
                </div>
            </div>
        `;
    }

    // アクションセクションを作成
    createActionsSection() {
        return `
            <div class="space-y-2">
                <h4 class="font-medium text-white">アクション</h4>
                <div class="flex flex-col space-y-2">
                    <button id="refresh-cache-stats" class="glass rounded-lg px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                        📊 統計を更新
                    </button>
                    <button id="cleanup-expired-cache" class="glass rounded-lg px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                        🧹 期限切れを削除
                    </button>
                    <button id="clear-all-cache" class="glass rounded-lg px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        🗑️ 全て削除
                    </button>
                </div>
            </div>
        `;
    }

    // イベントリスナーを設定
    setupEventListeners() {
        // 統計更新ボタン
        const refreshButton = document.getElementById('refresh-cache-stats');
        if (refreshButton) {
            refreshButton.addEventListener('click', async () => {
                await this.updateCacheStats();
                this.updatePanelContent();
                this.showNotification('統計を更新しました', 'success');
            });
        }

        // 期限切れ削除ボタン
        const cleanupButton = document.getElementById('cleanup-expired-cache');
        if (cleanupButton) {
            cleanupButton.addEventListener('click', async () => {
                const cleanedCount = window.uiCacheManager.cleanupExpiredCache();
                await this.updateCacheStats();
                this.updatePanelContent();
                this.showNotification(`${cleanedCount}個の期限切れキャッシュを削除しました`, 'success');
            });
        }

        // 全削除ボタン
        const clearAllButton = document.getElementById('clear-all-cache');
        if (clearAllButton) {
            clearAllButton.addEventListener('click', async () => {
                if (confirm('全てのキャッシュを削除しますか？')) {
                    const clearedCount = window.uiCacheManager.clearAllCache();
                    await this.updateCacheStats();
                    this.updatePanelContent();
                    this.showNotification(`${clearedCount}個のキャッシュを削除しました`, 'success');
                    
                    // アプリアイコンを更新
                    if (window.updateAppIcons) {
                        window.updateAppIcons();
                    }
                }
            });
        }

        // 個別削除ボタン
        const clearButtons = document.querySelectorAll('.clear-app-cache');
        clearButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const appId = e.target.dataset.appId;
                const appName = this.getAppName(appId);
                
                if (confirm(`${appName}のキャッシュを削除しますか？`)) {
                    const success = window.uiCacheManager.clearCache(appId);
                    if (success) {
                        await this.updateCacheStats();
                        this.updatePanelContent();
                        this.showNotification(`${appName}のキャッシュを削除しました`, 'success');
                        
                        // アプリアイコンを更新
                        if (window.updateAppIcons) {
                            window.updateAppIcons();
                        }
                    }
                }
            });
        });
    }

    // アプリ名を取得
    getAppName(appId) {
        const appNames = {
            'calculator': '電卓',
            'notepad': 'メモ帳',
            'clock': '時計',
            'weather': '天気',
            'todo': 'TODO',
            'draw': '描画'
        };
        return appNames[appId] || appId;
    }

    // 日付をフォーマット
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 通知表示
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 left-4 px-6 py-3 rounded-2xl shadow-2xl z-50 fade-in ${
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

    // キャッシュ状態インジケーターを更新
    updateCacheIndicator() {
        const indicator = document.getElementById('cache-indicator');
        if (indicator && this.cacheStats) {
            const { total_apps, total_size_kb } = this.cacheStats;
            indicator.textContent = total_apps > 0 ? `${total_apps} apps (${total_size_kb}KB)` : 'No cache';
        }
    }

    // キャッシュ統計を定期更新
    startStatsUpdate() {
        // 30秒ごとに統計を更新
        setInterval(async () => {
            await this.updateCacheStats();
            this.updateCacheIndicator();
            
            // パネルが表示されている場合は内容も更新
            if (this.panelVisible) {
                this.updatePanelContent();
            }
        }, 30000);
    }
}

// グローバルに公開
window.cacheManager = new CacheManager();