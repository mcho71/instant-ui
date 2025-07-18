// UIキャッシュ管理クラス
class UICacheManager {
    constructor() {
        this.storageManager = window.storageManager;
        this.cacheVersion = 'v1';
        this.defaultTTL = 7 * 24 * 60 * 60 * 1000; // 7日間（ミリ秒）
        this.dataType = 'ui-cache';
    }

    // キャッシュキーを生成
    generateCacheKey(appId, subKey = null) {
        return this.storageManager.generateKey(appId, this.dataType, subKey);
    }

    // UIをキャッシュに保存
    cacheUI(appId, uiData, options = {}) {
        try {
            const cacheData = {
                // UIデータ
                html: uiData.html,
                script: uiData.script,
                styles: uiData.styles,
                metadata: uiData.metadata,
                
                // キャッシュメタデータ
                cached_at: Date.now(),
                cache_version: this.cacheVersion,
                model_used: uiData._performance?.model || 'unknown',
                model_display_name: uiData._performance?.modelDisplayName || 'Unknown Model',
                generation_time: uiData._performance?.responseTime || 0,
                ttl: options.ttl || this.defaultTTL,
                
                // アプリメタデータ
                app_id: appId,
                app_version: options.appVersion || '1.0.0'
            };

            const success = this.storageManager.save(appId, this.dataType, cacheData);
            
            if (success) {
                console.log(`UI cached for app: ${appId}`, {
                    model: cacheData.model_display_name,
                    generation_time: cacheData.generation_time,
                    cached_at: new Date(cacheData.cached_at).toLocaleString()
                });
            }
            
            return success;
        } catch (error) {
            console.error('Error caching UI:', error);
            return false;
        }
    }

    // キャッシュからUIを取得
    getCachedUI(appId, options = {}) {
        try {
            const cacheData = this.storageManager.load(appId, this.dataType);
            
            if (!cacheData) {
                return null;
            }

            // キャッシュバリデーション
            if (!this.validateCache(cacheData, options)) {
                // 無効なキャッシュを削除
                this.clearCache(appId);
                return null;
            }

            console.log(`Cache hit for app: ${appId}`, {
                model: cacheData.model_display_name,
                cached_at: new Date(cacheData.cached_at).toLocaleString(),
                age: Math.round((Date.now() - cacheData.cached_at) / 1000 / 60) + ' minutes'
            });

            // UIデータを返す
            return {
                html: cacheData.html,
                script: cacheData.script,
                styles: cacheData.styles,
                metadata: cacheData.metadata,
                _cache: {
                    cached_at: cacheData.cached_at,
                    model_used: cacheData.model_used,
                    model_display_name: cacheData.model_display_name,
                    generation_time: cacheData.generation_time,
                    from_cache: true
                }
            };
        } catch (error) {
            console.error('Error getting cached UI:', error);
            return null;
        }
    }

    // キャッシュの有効性を検証
    validateCache(cacheData, options = {}) {
        const now = Date.now();
        
        // TTLチェック
        const age = now - cacheData.cached_at;
        const ttl = options.ttl || cacheData.ttl || this.defaultTTL;
        
        if (age > ttl) {
            console.log(`Cache expired for app: ${cacheData.app_id}`, {
                age: Math.round(age / 1000 / 60) + ' minutes',
                ttl: Math.round(ttl / 1000 / 60) + ' minutes'
            });
            return false;
        }

        // バージョンチェック
        if (cacheData.cache_version !== this.cacheVersion) {
            console.log(`Cache version mismatch for app: ${cacheData.app_id}`, {
                cached_version: cacheData.cache_version,
                current_version: this.cacheVersion
            });
            return false;
        }

        // 必須フィールドチェック
        if (!cacheData.html || !cacheData.metadata) {
            console.log(`Invalid cache data for app: ${cacheData.app_id}`);
            return false;
        }

        return true;
    }

    // 特定のアプリのキャッシュを削除
    clearCache(appId) {
        try {
            const success = this.storageManager.remove(appId, this.dataType);
            if (success) {
                console.log(`Cache cleared for app: ${appId}`);
            }
            return success;
        } catch (error) {
            console.error('Error clearing cache:', error);
            return false;
        }
    }

    // 全てのUIキャッシュを削除
    clearAllCache() {
        try {
            const apps = this.getCachedApps();
            let clearedCount = 0;
            
            apps.forEach(appId => {
                if (this.clearCache(appId)) {
                    clearedCount++;
                }
            });
            
            console.log(`Cleared ${clearedCount} UI caches`);
            return clearedCount;
        } catch (error) {
            console.error('Error clearing all cache:', error);
            return 0;
        }
    }

    // キャッシュされているアプリの一覧を取得
    getCachedApps() {
        try {
            const allApps = this.storageManager.getStoredApps();
            const cachedApps = [];
            
            allApps.forEach(appId => {
                const cacheData = this.storageManager.load(appId, this.dataType);
                if (cacheData) {
                    cachedApps.push(appId);
                }
            });
            
            return cachedApps;
        } catch (error) {
            console.error('Error getting cached apps:', error);
            return [];
        }
    }

    // キャッシュ統計を取得
    getCacheStats() {
        try {
            const cachedApps = this.getCachedApps();
            const stats = {
                total_apps: cachedApps.length,
                total_size: 0,
                total_size_kb: 0,
                apps: {},
                oldest_cache: null,
                newest_cache: null
            };
            
            cachedApps.forEach(appId => {
                const cacheData = this.storageManager.load(appId, this.dataType);
                if (cacheData) {
                    const cacheKey = this.generateCacheKey(appId);
                    const cacheValue = localStorage.getItem(cacheKey);
                    const size = cacheKey.length + (cacheValue ? cacheValue.length : 0);
                    
                    stats.total_size += size;
                    stats.apps[appId] = {
                        cached_at: cacheData.cached_at,
                        model_used: cacheData.model_display_name,
                        generation_time: cacheData.generation_time,
                        size: size,
                        size_kb: Math.round(size / 1024 * 100) / 100,
                        age_minutes: Math.round((Date.now() - cacheData.cached_at) / 1000 / 60)
                    };
                    
                    // 最古・最新のキャッシュを追跡
                    if (!stats.oldest_cache || cacheData.cached_at < stats.oldest_cache.cached_at) {
                        stats.oldest_cache = { app_id: appId, cached_at: cacheData.cached_at };
                    }
                    if (!stats.newest_cache || cacheData.cached_at > stats.newest_cache.cached_at) {
                        stats.newest_cache = { app_id: appId, cached_at: cacheData.cached_at };
                    }
                }
            });
            
            stats.total_size_kb = Math.round(stats.total_size / 1024 * 100) / 100;
            
            return stats;
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return null;
        }
    }

    // キャッシュが存在するかチェック
    hasCache(appId) {
        try {
            const cacheData = this.storageManager.load(appId, this.dataType);
            return cacheData !== null && this.validateCache(cacheData);
        } catch (error) {
            console.error('Error checking cache:', error);
            return false;
        }
    }

    // キャッシュの有効期限を更新
    refreshCacheTTL(appId, newTTL = null) {
        try {
            const cacheData = this.storageManager.load(appId, this.dataType);
            if (!cacheData) {
                return false;
            }

            cacheData.ttl = newTTL || this.defaultTTL;
            cacheData.cached_at = Date.now(); // リフレッシュ時刻を更新
            
            const success = this.storageManager.save(appId, this.dataType, cacheData);
            if (success) {
                console.log(`Cache TTL refreshed for app: ${appId}`);
            }
            
            return success;
        } catch (error) {
            console.error('Error refreshing cache TTL:', error);
            return false;
        }
    }

    // 期限切れのキャッシュを一括削除
    cleanupExpiredCache() {
        try {
            const cachedApps = this.getCachedApps();
            let cleanedCount = 0;
            
            cachedApps.forEach(appId => {
                const cacheData = this.storageManager.load(appId, this.dataType);
                if (cacheData && !this.validateCache(cacheData)) {
                    if (this.clearCache(appId)) {
                        cleanedCount++;
                    }
                }
            });
            
            if (cleanedCount > 0) {
                console.log(`Cleaned up ${cleanedCount} expired caches`);
            }
            
            return cleanedCount;
        } catch (error) {
            console.error('Error cleaning up expired cache:', error);
            return 0;
        }
    }
}

// グローバルに公開
window.uiCacheManager = new UICacheManager();

// 定期的な期限切れキャッシュのクリーンアップ（10分間隔）
setInterval(() => {
    window.uiCacheManager.cleanupExpiredCache();
}, 10 * 60 * 1000);