# Instant UI - 実装計画書

## 実装タスク一覧

### 1. プロジェクト基盤
- [ ] package.json作成（Express、dotenv等の依存関係）
- [ ] .env.exampleファイル作成
- [ ] .envファイル作成（実際のトークン設定）
- [ ] 基本的なフォルダ構造作成
- [ ] .gitignoreファイル作成（.envを含める）

### 2. サーバーサイド実装
- [ ] Express基本サーバー（server.js）
- [ ] 環境変数の読み込み設定
- [ ] 静的ファイル配信設定
- [ ] Vertex AI接続モジュール（src/vertex-ai.js）
- [ ] APIエンドポイント（/api/generate-ui）
- [ ] エラーハンドリング

### 3. フロントエンド基盤
- [ ] index.html（Tailwind CDN含む）
- [ ] メインアプリケーション（public/js/app.js）
- [ ] アプリアイコン用のassets/iconsフォルダ

### 4. アプリランチャー
- [ ] ランチャーグリッドのレイアウト
- [ ] アプリアイコンとメタデータ定義
- [ ] ホバーエフェクト
- [ ] クリックイベントハンドラー

### 5. AI連携
- [ ] AIクライアント（public/js/ai-client.js）
- [ ] プロンプトテンプレート構造
- [ ] レスポンスパーサー
- [ ] エラーハンドリング

### 6. ウィンドウシステム
- [ ] ウィンドウマネージャー（public/js/window-manager.js）
- [ ] ドラッグ機能
- [ ] 閉じるボタン
- [ ] 複数ウィンドウ管理

### 7. プロンプトテンプレート
- [ ] システムプロンプト（prompts/system.txt）
- [ ] 電卓プロンプト（prompts/apps/calculator.txt）
- [ ] その他アプリのプロンプト基本形

### 8. 電卓アプリ実装
- [ ] プロンプトの作成と調整
- [ ] 生成されたUIのテスト
- [ ] 機能の検証
- [ ] デザインの改善

### 9. その他のアプリ
- [ ] メモ帳
- [ ] 時計
- [ ] 天気
- [ ] TODOリスト
- [ ] 描画ツール

### 10. UI/UX改善
- [ ] ローディング表示
- [ ] エラー表示
- [ ] アニメーション
- [ ] レスポンシブ対応

### 11. ドキュメント
- [ ] README.md作成
- [ ] セットアップガイド
- [ ] プロンプト調整ガイド

## 実装の流れ

### Step 1: 基本構造の構築
1. プロジェクト初期化
2. 環境変数設定
3. サーバー実装
4. 基本的なHTML/CSS

### Step 2: AI連携
1. Vertex AI接続（.envから認証情報読み込み）
2. 基本的なプロンプト
3. レスポンス処理

### Step 3: アプリ実装
1. 電卓から開始
2. プロンプト調整（ユーザーと相談）
3. 他のアプリへ展開

## 注意事項

- プロンプトの詳細はユーザーと相談しながら調整
- まずは動くものを作り、徐々に改善
- エラーハンドリングを適切に実装
- コードはシンプルに保つ
- .envファイルは絶対にコミットしない

## 技術スタック

### バックエンド
- Node.js
- Express
- @google-cloud/aiplatform（Vertex AI SDK）
- dotenv

### フロントエンド
- Vanilla JavaScript
- Tailwind CSS (CDN)
- LocalStorage API（アプリデータ保存用）

### 開発ツール
- nodemon（開発時の自動リロード）
- npm scripts

## 環境変数構成

```env
# Vertex AI設定
VERTEX_AI_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=asia-northeast1
VERTEX_AI_ACCESS_TOKEN=your-access-token

# サーバー設定
PORT=3000
```