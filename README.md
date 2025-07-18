# Instant UI - AI駆動アプリランチャー

Google Vertex AIのGemini Flash Liteモデルを使用して、ユーザーのアクションに応じて動的にUIを生成するWebアプリケーションの試作です。

## 特徴

- **AI駆動のUI生成**: アプリアイコンをクリックすると、AIが完全に機能するアプリUIを即座に生成
- **デスクトップライクUI**: ドラッグ可能なウィンドウシステム
- **リアルタイム生成**: Gemini Flash Liteによる高速レスポンス

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを編集して、Vertex AIの認証情報を設定してください：

```env
VERTEX_AI_PROJECT_ID=your-google-cloud-project-id
VERTEX_AI_LOCATION=asia-northeast1
VERTEX_AI_ACCESS_TOKEN=your-vertex-ai-access-token
PORT=3000
```

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

## プロンプト調整

AIプロンプトは `prompts/` ディレクトリで管理されています：

- `prompts/system.txt` - システムプロンプト
- `prompts/apps/` - 各アプリ用のプロンプト

## 技術スタック

- **フロントエンド**: Vanilla JavaScript, Tailwind CSS
- **バックエンド**: Node.js, Express
- **AI**: Google Vertex AI (Gemini Flash Lite)

## 注意事項

- これは試作アプリです
- Vertex AIのAPIキーが必要です
- `.env`ファイルは絶対にコミットしないでください

## ライセンス

MIT License