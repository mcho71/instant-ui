// アプリケーションのメタデータ
const apps = [
    {
        id: 'calculator',
        name: '電卓',
        icon: '🧮',
        gradient: 'from-blue-500 to-blue-600',
        description: '基本的な計算機能'
    },
    {
        id: 'notepad',
        name: 'メモ帳',
        icon: '📝',
        gradient: 'from-green-500 to-green-600',
        description: 'テキスト編集'
    },
    {
        id: 'clock',
        name: '時計',
        icon: '🕐',
        gradient: 'from-purple-500 to-purple-600',
        description: '現在時刻表示'
    },
    {
        id: 'weather',
        name: '天気',
        icon: '🌤️',
        gradient: 'from-orange-500 to-orange-600',
        description: '天気予報'
    },
    {
        id: 'todo',
        name: 'TODO',
        icon: '✅',
        gradient: 'from-pink-500 to-pink-600',
        description: 'タスク管理'
    },
    {
        id: 'draw',
        name: '描画',
        icon: '🎨',
        gradient: 'from-indigo-500 to-indigo-600',
        description: 'ペイントツール'
    }
];

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    renderAppLauncher();
});

// アプリランチャーの描画
function renderAppLauncher() {
    const launcher = document.querySelector('#launcher .grid');
    
    apps.forEach((app, index) => {
        const appElement = createAppIcon(app);
        // アニメーション遅延を追加
        setTimeout(() => {
            appElement.classList.add('slide-up');
            launcher.appendChild(appElement);
        }, index * 100);
    });
}

// アプリアイコンの作成
function createAppIcon(app) {
    const div = document.createElement('div');
    div.className = 'app-icon text-center tooltip';
    div.setAttribute('data-tooltip', app.description);
    div.innerHTML = `
        <div class="app-card bg-gradient-to-br ${app.gradient} text-white rounded-3xl p-8 mb-3 shadow-xl hover:shadow-2xl relative overflow-hidden">
            <div class="text-5xl mb-2 relative z-10">${app.icon}</div>
        </div>
        <p class="text-sm font-semibold text-white drop-shadow-sm">${app.name}</p>
        <p class="text-xs text-white/70 mt-1">${app.description}</p>
    `;
    
    div.addEventListener('click', () => launchApp(app));
    
    return div;
}

// アプリの起動
async function launchApp(app) {
    console.log(`Launching ${app.name}...`);
    
    // クリックフィードバック
    const appElement = event.currentTarget;
    appElement.classList.add('pulse');
    
    // ローディング表示
    showLoading();
    
    try {
        // AIにUI生成をリクエスト
        const response = await window.aiClient.generateUI(app.id, {
            appName: app.name,
            appType: app.id
        });
        
        // ウィンドウを作成して表示
        const windowElement = window.windowManager.createWindow({
            title: app.name,
            content: response.html,
            script: response.script,
            styles: response.styles,
            metadata: response.metadata
        });
        
        // ローディング非表示
        hideLoading();
        
        // 成功フィードバック
        showSuccess(`${app.name}を起動しました`);
        
    } catch (error) {
        console.error('Error launching app:', error);
        showError('アプリの起動に失敗しました: ' + error.message);
        hideLoading();
    } finally {
        // アニメーション除去
        setTimeout(() => {
            appElement.classList.remove('pulse');
        }, 1000);
    }
}

// ローディング表示
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

// ローディング非表示
function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// エラー表示
function showError(message) {
    const errorElement = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    
    errorMessage.textContent = message;
    errorElement.classList.remove('hidden');
    
    // 5秒後に自動的に非表示
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 5000);
}

// 成功メッセージ表示
function showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'fixed bottom-4 left-4 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 fade-in';
    successElement.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2">✅</span>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(successElement);
    
    // 3秒後に自動的に削除
    setTimeout(() => {
        successElement.remove();
    }, 3000);
}