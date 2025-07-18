# Instant UI - AI駆動アプリランチャー

Google Vertex AIのGemini 2.5/2.0 Flash-Liteモデルを使用して、ユーザーのアクションに応じて動的にUIを生成するWebアプリケーションです。

## 特徴

- **AI駆動のUI生成**: アプリアイコンをクリックすると、AIが完全に機能するアプリUIを即座に生成
- **デュアルモデル対応**: Gemini 2.5 Flash-Lite（グローバル）と2.0 Flash-Lite（リージョナル）のリアルタイム切り替え
- **高速キャッシュシステム**: 生成されたUIをローカルキャッシュして瞬時に再起動
- **デスクトップライクUI**: ドラッグ移動・リサイズ可能なウィンドウシステム
- **パフォーマンス監視**: 各モデルの応答時間を追跡・比較
- **オフライン対応**: キャッシュされたアプリはオフラインでも利用可能

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成して、Google AI APIの認証情報を設定してください：

```env
GOOGLE_AI_API_KEY=your-google-ai-api-key
GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
PORT=3000
```

**APIキーの取得方法**:
1. [Google AI Studio](https://aistudio.google.com/) でAPIキーを作成
2. Google Cloud Consoleでプロジェクトを作成（リージョナルエンドポイント用）

### 3. サーバーの起動

```bash
# 開発モード（自動リロード）
npm run dev

# 本番モード
npm start
```

### 4. アクセス

ブラウザで `http://localhost:3000` にアクセスしてください。

## 対応アプリ

現在対応している生成アプリ：

- 🧮 **電卓** - 基本的な四則演算
- 📝 **メモ帳** - テキスト編集と保存
- 🕐 **時計** - リアルタイム時刻表示
- 🌤️ **天気** - 天気情報表示
- ✅ **TODO** - タスク管理
- 🎨 **描画** - 簡単なペイントツール

## 使用方法

### 基本操作
- **アプリ起動**: アプリアイコンをクリック
- **強制再生成**: Shift+クリックでキャッシュを無視して新しいUIを生成
- **ウィンドウ操作**: ドラッグで移動、端をドラッグでリサイズ
- **ウィンドウ閉じる**: ESCキーまたは×ボタン

### モデル切り替え
- ヘッダーのモデル選択で2.5/2.0 Flash-Liteを切り替え
- 📊アイコンでパフォーマンス統計を表示

### キャッシュ管理
- 💾ボタンでキャッシュ管理パネルを表示
- 個別またはすべてのキャッシュを削除可能
- キャッシュサイズと使用量の確認

## プロンプト調整

AIプロンプトは `prompts/` ディレクトリで管理されています：

- `prompts/system.txt` - システムプロンプト
- `prompts/apps/` - 各アプリ用のプロンプト

## 技術スタック

- **フロントエンド**: Vanilla JavaScript, Tailwind CSS
- **バックエンド**: Node.js, Express
- **AI**: Google Vertex AI (Gemini 2.5/2.0 Flash-Lite)
- **SDK**: @google/genai
- **ストレージ**: localStorage (キャッシュ管理)

## アーキテクチャ

### フロントエンド
- `public/js/app.js` - メインアプリケーションロジック
- `public/js/window-manager.js` - ウィンドウシステム管理
- `public/js/ui-cache.js` - UIキャッシュ管理
- `public/js/cache-manager.js` - キャッシュ管理UI
- `public/js/model-switcher.js` - モデル切り替え機能
- `public/js/ai-client.js` - AI API通信
- `public/js/storage.js` - ローカルストレージ管理

### バックエンド
- `server.js` - Express サーバー
- `src/vertex-ai.js` - AI接続とモデル管理
- `prompts/` - AI プロンプト管理

## パフォーマンス

### キャッシュ機能
- **初回生成**: 1-3秒（AI生成時間）
- **キャッシュヒット**: 即座に表示（~50ms）
- **キャッシュ容量**: 無制限（localStorage使用）
- **有効期限**: 7日間（設定可能）

### モデル比較
- **Gemini 2.5 Flash-Lite**: 高品質、グローバルエンドポイント
- **Gemini 2.0 Flash-Lite**: 高速、リージョナルエンドポイント

## 注意事項

- これは試作アプリです
- Google AI APIキーが必要です
- `.env`ファイルは絶対にコミットしないでください
- リージョナルエンドポイントにはGoogle Cloud Projectが必要です

## ライセンス

MIT License