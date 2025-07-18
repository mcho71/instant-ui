// アプリケーションのメタデータ
const apps = [
    {
        id: 'calculator',
        name: '電卓',
        icon: '🧮',
        color: 'bg-blue-500',
        description: '基本的な計算機能'
    },
    {
        id: 'notepad',
        name: 'メモ帳',
        icon: '📝',
        color: 'bg-green-500',
        description: 'テキスト編集'
    },
    {
        id: 'clock',
        name: '時計',
        icon: '🕐',
        color: 'bg-purple-500',
        description: '現在時刻表示'
    },
    {
        id: 'weather',
        name: '天気',
        icon: '🌤️',
        color: 'bg-orange-500',
        description: '天気予報'
    },
    {
        id: 'todo',
        name: 'TODO',
        icon: '✅',
        color: 'bg-pink-500',
        description: 'タスク管理'
    },
    {
        id: 'draw',
        name: '描画',
        icon: '🎨',
        color: 'bg-indigo-500',
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
    
    apps.forEach(app => {
        const appElement = createAppIcon(app);
        launcher.appendChild(appElement);
    });
}

// アプリアイコンの作成
function createAppIcon(app) {
    const div = document.createElement('div');
    div.className = 'app-icon cursor-pointer text-center';
    div.innerHTML = `
        <div class="${app.color} text-white rounded-2xl p-6 mb-2 shadow-lg hover:shadow-xl">
            <div class="text-4xl mb-2">${app.icon}</div>
        </div>
        <p class="text-sm font-medium text-gray-700">${app.name}</p>
        <p class="text-xs text-gray-500">${app.description}</p>
    `;
    
    div.addEventListener('click', () => launchApp(app));
    
    return div;
}

// アプリの起動
async function launchApp(app) {
    console.log(`Launching ${app.name}...`);
    
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
        
    } catch (error) {
        console.error('Error launching app:', error);
        showError('アプリの起動に失敗しました: ' + error.message);
        hideLoading();
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