// LocalStorage管理ユーティリティ
class StorageManager {
    constructor() {
        this.prefix = 'instant-ui-';
        this.version = 'v1';
        this.separator = '-';
    }

    // 標準化されたキーを生成
    generateKey(appId, dataType, subKey = null) {
        let key = `${this.prefix}${this.version}${this.separator}${appId}${this.separator}${dataType}`;
        if (subKey) {
            key += `${this.separator}${subKey}`;
        }
        return key;
    }

    // データの保存
    save(appId, dataType, data, subKey = null) {
        const key = this.generateKey(appId, dataType, subKey);
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            console.log(`Data saved to localStorage: ${key}`);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    // データの読み込み
    load(appId, dataType, subKey = null, defaultValue = null) {
        const key = this.generateKey(appId, dataType, subKey);
        try {
            const jsonData = localStorage.getItem(key);
            if (jsonData === null) {
                return defaultValue;
            }
            return JSON.parse(jsonData);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    }

    // データの削除
    remove(appId, dataType, subKey = null) {
        const key = this.generateKey(appId, dataType, subKey);
        try {
            localStorage.removeItem(key);
            console.log(`Data removed from localStorage: ${key}`);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    // アプリの全データを削除
    clearAppData(appId) {
        const prefix = this.generateKey(appId, '');
        const keys = [];
        
        // 該当するキーを検索
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keys.push(key);
            }
        }
        
        // 削除実行
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log(`Cleared ${keys.length} items for app: ${appId}`);
        return keys.length;
    }

    // 全てのアプリデータを削除
    clearAllData() {
        const keys = [];
        
        // 該当するキーを検索
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keys.push(key);
            }
        }
        
        // 削除実行
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log(`Cleared all instant-ui data: ${keys.length} items`);
        return keys.length;
    }

    // 使用量の取得
    getUsage() {
        let totalSize = 0;
        const itemCount = {
            total: 0,
            byApp: {}
        };
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                const value = localStorage.getItem(key);
                totalSize += key.length + (value ? value.length : 0);
                itemCount.total++;
                
                // アプリ別カウント
                const appId = this.extractAppId(key);
                if (appId) {
                    itemCount.byApp[appId] = (itemCount.byApp[appId] || 0) + 1;
                }
            }
        }
        
        return {
            totalSize: totalSize,
            totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
            itemCount: itemCount
        };
    }

    // キーからアプリIDを抽出
    extractAppId(key) {
        const pattern = new RegExp(`^${this.prefix}${this.version}${this.separator}([^${this.separator}]+)`);
        const match = key.match(pattern);
        return match ? match[1] : null;
    }

    // 利用可能なアプリ一覧
    getStoredApps() {
        const apps = new Set();
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                const appId = this.extractAppId(key);
                if (appId) {
                    apps.add(appId);
                }
            }
        }
        
        return Array.from(apps);
    }
}

// 共通のデータタイプ定数
const DATA_TYPES = {
    SETTINGS: 'settings',
    DATA: 'data',
    CACHE: 'cache',
    PREFERENCES: 'preferences',
    STATE: 'state',
    HISTORY: 'history',
    TEMP: 'temp'
};

// グローバルに公開
window.storageManager = new StorageManager();
window.DATA_TYPES = DATA_TYPES;

// 使用例をコメントで記載
/*
使用例:

// 設定を保存
window.storageManager.save('calculator', DATA_TYPES.SETTINGS, {
    theme: 'dark',
    precision: 2
});

// データを読み込み
const settings = window.storageManager.load('calculator', DATA_TYPES.SETTINGS, null, {
    theme: 'light',
    precision: 4
});

// 履歴を保存（サブキー付き）
window.storageManager.save('calculator', DATA_TYPES.HISTORY, calculation, 'calc-1');

// アプリの全データを削除
window.storageManager.clearAppData('calculator');

// 使用量を確認
const usage = window.storageManager.getUsage();
console.log(`使用量: ${usage.totalSizeKB}KB, アイテム数: ${usage.itemCount.total}`);
*/