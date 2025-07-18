# Claude Development Notes

このファイルはClaude Codeでの開発における重要な情報を記録します。

## プロジェクト概要

**Instant UI** - AI駆動アプリランチャー
- Google Vertex AI (Gemini Flash Lite) を使用
- ユーザーのアクションに応じて動的にUIを生成
- デスクトップライクなWebアプリケーション

## 開発環境

### 必要な環境変数
```env
VERTEX_AI_PROJECT_ID=your-google-cloud-project-id
VERTEX_AI_LOCATION=asia-northeast1
VERTEX_AI_ACCESS_TOKEN=your-vertex-ai-access-token
PORT=3000
```

### 開発コマンド
```bash
npm run dev    # 開発モード（nodemon使用）
npm start      # 本番モード
npm install    # 依存関係インストール
```

## アーキテクチャ

### ディレクトリ構造
```
instant-ui/
├── public/           # フロントエンド
│   ├── index.html   # メインページ
│   └── js/          # JavaScript
├── src/             # バックエンド
│   └── vertex-ai.js # AI接続
├── prompts/         # AIプロンプト
│   ├── system.txt   # システムプロンプト
│   └── apps/        # アプリ別プロンプト
└── server.js        # Express サーバー
```

### 技術スタック
- **フロントエンド**: Vanilla JavaScript, Tailwind CSS (CDN)
- **バックエンド**: Node.js, Express
- **AI**: Google Vertex AI (Gemini 2.5 Flash-Lite)
- **認証**: アクセストークン (.env管理)

## AIプロンプト管理

### プロンプト構造
1. **システムプロンプト** (`prompts/system.txt`)
   - UI生成の基本ルール
   - 出力形式の定義
   - 品質基準

2. **アプリ別プロンプト** (`prompts/apps/`)
   - 各アプリの詳細仕様
   - 機能要件
   - デザイン要件

### プロンプト調整時の注意点
- JSON形式での出力を必須とする
- Tailwind CSSクラスのみ使用
- インラインJavaScriptで機能実装
- エラーハンドリングを含める

## 開発時の重要事項

### 1. タスク管理 (TodoWrite)
- **必須**: 作業進捗に応じてTodoListを常に更新
- タスク開始時: `status: "in_progress"`に変更
- タスク完了時: `status: "completed"`に変更
- 新しいタスクが発生した場合: 適切な優先度で追加
- 各コミット前にtodos状況を確認・更新

### 2. コミット規則
- 各todoステップごとにコミット
- 明確なコミットメッセージ
- 共同開発者としてClaudeを記載
- コミット前にtodosの状態を更新

### 3. プロンプト開発
- ユーザーと相談しながら調整
- 品質重視（速度は二の次）
- 段階的な改善アプローチ

### 4. セキュリティ
- .envファイルは絶対にコミットしない
- APIキーの適切な管理
- 入力検証の実装

## 対応アプリ一覧

### 実装済み
- 🧮 **電卓** - プロンプト作成済み

### 実装予定
- 📝 **メモ帳** - テキスト編集と保存
- 🕐 **時計** - リアルタイム時刻表示
- 🌤️ **天気** - 天気情報表示
- ✅ **TODO** - タスク管理
- 🎨 **描画** - ペイントツール

## API設計

### エンドポイント
- `POST /api/generate-ui` - UI生成リクエスト

### リクエスト形式
```json
{
  "appType": "calculator",
  "context": {
    "appName": "電卓"
  }
}
```

### レスポンス形式
```json
{
  "success": true,
  "data": {
    "html": "生成されたHTML",
    "script": "初期化JavaScript",
    "styles": "追加CSS",
    "metadata": {
      "title": "アプリ名",
      "defaultSize": { "width": 400, "height": 500 }
    }
  }
}
```

## トラブルシューティング

### よくある問題
1. **Vertex AI認証エラー**
   - .envファイルの設定確認
   - アクセストークンの有効性確認

2. **プロンプト生成失敗**
   - フォールバックUIで対応
   - エラーログの確認

3. **ウィンドウ表示問題**
   - ブラウザの開発者ツールで確認
   - JavaScript エラーの確認

### デバッグ方法
- サーバーログの確認
- ブラウザのコンソールログ
- ネットワークタブでAPI通信確認

## 今後の発展

### 短期目標
- 電卓アプリの完璧な動作
- プロンプトの最適化
- 他アプリのプロンプト作成

### 長期目標
- 自然言語でのアプリリクエスト
- UIの保存・再利用機能
- アプリ間連携
- カスタマイズ機能

## 開発ガイドライン

### プロンプト開発
1. 簡潔で明確な指示
2. 具体的な例の提供
3. エラーケースの考慮
4. 段階的な改善

### コード品質
1. シンプルで読みやすいコード
2. 適切なエラーハンドリング
3. コメントによる説明
4. 一貫したコーディングスタイル

---

**最終更新**: 初期実装完了時
**次回タスク**: プロンプト調整とAI生成テスト