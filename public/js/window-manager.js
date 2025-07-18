// ウィンドウマネージャー
class WindowManager {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.zIndexCounter = 1000;
        this.container = document.getElementById('window-container');
        
        // ESCキーでアクティブウィンドウを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeWindow) {
                this.closeWindow(this.activeWindow);
            }
        });
    }

    // ウィンドウの作成
    createWindow(options) {
        const windowId = 'window-' + Date.now();
        const windowElement = this.buildWindowElement(windowId, options);
        
        // コンテナに追加
        this.container.appendChild(windowElement);
        this.container.classList.remove('pointer-events-none');
        
        // ウィンドウを管理
        this.windows.set(windowId, {
            element: windowElement,
            options: options
        });
        
        // 初期位置を設定（画面中央）
        this.centerWindow(windowElement);
        
        // イベントリスナーの設定
        this.setupWindowEvents(windowId, windowElement);
        
        // アクティブにする
        this.activateWindow(windowId);
        
        // スクリプトの実行
        if (options.script) {
            this.executeWindowScript(windowId, options.script);
        }
        
        return windowElement;
    }

    // ウィンドウ要素の構築
    buildWindowElement(windowId, options) {
        const div = document.createElement('div');
        div.id = windowId;
        div.className = 'window absolute glass rounded-2xl shadow-2xl fade-in pointer-events-auto';
        div.style.width = (options.metadata?.defaultSize?.width || 400) + 'px';
        div.style.height = (options.metadata?.defaultSize?.height || 500) + 'px';
        
        div.innerHTML = `
            <div class="window-header bg-white/10 rounded-t-2xl px-4 py-3 flex justify-between items-center cursor-move border-b border-white/20">
                <div class="flex items-center">
                    <div class="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                    <div class="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                    <div class="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                    <h3 class="text-sm font-semibold text-white">${options.title}</h3>
                </div>
                <button class="window-close text-white/70 hover:text-white text-xl leading-none transition-colors">&times;</button>
            </div>
            <div class="window-content overflow-auto bg-white/95 rounded-b-2xl" style="height: calc(100% - 48px);">
                ${options.styles ? `<style>${options.styles}</style>` : ''}
                ${options.content}
            </div>
        `;
        
        return div;
    }

    // ウィンドウを画面中央に配置
    centerWindow(windowElement) {
        const rect = windowElement.getBoundingClientRect();
        const x = (window.innerWidth - rect.width) / 2;
        const y = (window.innerHeight - rect.height) / 2 - 50;
        
        // ランダムなオフセットを追加（複数ウィンドウの重複を避ける）
        const randomOffset = this.windows.size * 30;
        windowElement.style.left = Math.max(0, x + randomOffset) + 'px';
        windowElement.style.top = Math.max(0, y + randomOffset) + 'px';
    }

    // ウィンドウイベントの設定
    setupWindowEvents(windowId, windowElement) {
        const header = windowElement.querySelector('.window-header');
        const closeButton = windowElement.querySelector('.window-close');
        
        // ドラッグ機能
        this.setupDragging(windowElement, header);
        
        // 閉じるボタン
        closeButton.addEventListener('click', () => {
            this.closeWindow(windowId);
        });
        
        // クリックでアクティブ化
        windowElement.addEventListener('mousedown', () => {
            this.activateWindow(windowId);
        });
    }

    // ドラッグ機能の設定
    setupDragging(windowElement, dragHandle) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = windowElement.offsetLeft;
            initialY = windowElement.offsetTop;
            
            windowElement.classList.add('window-dragging');
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            windowElement.style.left = (initialX + dx) + 'px';
            windowElement.style.top = (initialY + dy) + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            windowElement.classList.remove('window-dragging');
        });
    }

    // ウィンドウのアクティブ化
    activateWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        // 既存のアクティブウィンドウを非アクティブに
        if (this.activeWindow && this.activeWindow !== windowId) {
            const prevWindow = this.windows.get(this.activeWindow);
            if (prevWindow) {
                prevWindow.element.classList.remove('z-50');
            }
        }
        
        // 新しいウィンドウをアクティブに
        windowData.element.style.zIndex = ++this.zIndexCounter;
        this.activeWindow = windowId;
    }

    // ウィンドウのクローズ
    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        // フェードアウトアニメーション
        windowData.element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        windowData.element.style.opacity = '0';
        windowData.element.style.transform = 'scale(0.8) translateY(-20px)';
        
        setTimeout(() => {
            windowData.element.remove();
            this.windows.delete(windowId);
            
            // すべてのウィンドウが閉じられたらコンテナを無効化
            if (this.windows.size === 0) {
                this.container.classList.add('pointer-events-none');
                this.activeWindow = null;
            }
        }, 300);
    }

    // ウィンドウ内でスクリプトを実行
    executeWindowScript(windowId, script) {
        try {
            console.log('Executing script for window:', windowId);
            console.log('Script content:', script.substring(0, 200) + '...');
            
            // ウィンドウ固有のコンテキストでスクリプトを実行
            const windowElement = document.getElementById(windowId);
            const windowContent = windowElement.querySelector('.window-content');
            
            if (!windowElement || !windowContent) {
                console.error('Window elements not found for ID:', windowId);
                return;
            }
            
            // スクリプトを関数でラップして実行
            const wrappedScript = `
                (function() {
                    console.log('Script executing for window ID: ${windowId}');
                    const windowElement = document.getElementById('${windowId}');
                    const windowContent = windowElement.querySelector('.window-content');
                    
                    if (!windowElement || !windowContent) {
                        console.error('Window elements not found in script context');
                        return;
                    }
                    
                    try {
                        ${script}
                        console.log('Script executed successfully for window: ${windowId}');
                    } catch (scriptError) {
                        console.error('Error in window script execution:', scriptError);
                    }
                })();
            `;
            
            // スクリプトタグを作成して実行
            const scriptElement = document.createElement('script');
            scriptElement.textContent = wrappedScript;
            document.body.appendChild(scriptElement);
            document.body.removeChild(scriptElement);
            
            console.log('Script element created and executed for window:', windowId);
            
        } catch (error) {
            console.error('Error executing window script:', error);
        }
    }
}

// グローバルに公開
window.windowManager = new WindowManager();