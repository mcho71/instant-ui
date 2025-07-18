# Claude Development Notes

このファイルはClaude Codeでの開発における重要な情報を記録します。

## プロジェクト概要

**Instant UI** - AI駆動アプリランチャー
- Google Vertex AI (Gemini 2.5/2.0 Flash-Lite) を使用
- ユーザーのアクションに応じて動的にUIを生成
- デスクトップライクなWebアプリケーション
- デュアルエンドポイント対応（グローバル・リージョナル）
- 高速キャッシュシステム搭載

## 開発環境

### 必要な環境変数
```env
GOOGLE_AI_API_KEY=your-google-ai-api-key
GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
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
├── public/                    # フロントエンド
│   ├── index.html            # メインページ
│   └── js/                   # JavaScript
│       ├── app.js           # メインアプリケーション
│       ├── window-manager.js # ウィンドウシステム
│       ├── ui-cache.js      # UIキャッシュ管理
│       ├── cache-manager.js # キャッシュUI管理
│       ├── model-switcher.js # モデル切り替え
│       ├── ai-client.js     # AI API通信
│       └── storage.js       # ストレージ管理
├── src/                      # バックエンド
│   └── vertex-ai.js         # AI接続とモデル管理
├── prompts/                  # AIプロンプト
│   ├── system.txt           # システムプロンプト
│   └── apps/                # アプリ別プロンプト
├── server.js                 # Express サーバー
└── package.json             # 依存関係
```

### 技術スタック
- **フロントエンド**: Vanilla JavaScript, Tailwind CSS (CDN)
- **バックエンド**: Node.js, Express
- **AI**: Google Vertex AI (Gemini 2.5/2.0 Flash-Lite)
- **SDK**: @google/genai
- **認証**: API キー + プロジェクトID (.env管理)
- **ストレージ**: localStorage (キャッシュ)

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

### 実装済み (全6アプリ)
- 🧮 **電卓** - 基本的な四則演算
- 📝 **メモ帳** - テキスト編集と保存
- 🕐 **時計** - リアルタイム時刻表示
- 🌤️ **天気** - 天気情報表示（外部API不使用）
- ✅ **TODO** - タスク管理
- 🎨 **描画** - ペイントツール

## API設計

### エンドポイント
- `POST /api/generate-ui` - UI生成リクエスト
- `GET /api/models` - モデル情報取得
- `POST /api/models/switch` - モデル切り替え
- `GET /api/performance` - パフォーマンス統計

### リクエスト形式
```json
{
  "appType": "calculator",
  "context": {
    "appName": "電卓"
  },
  "model": "gemini-2.5-flash-lite" // オプション
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
    },
    "_performance": {
      "model": "gemini-2.5-flash-lite",
      "responseTime": 1250,
      "timestamp": "2025-01-18T10:30:00Z"
    }
  }
}
```

## トラブルシューティング

### よくある問題
1. **Google AI API認証エラー**
   - .envファイルの設定確認
   - APIキーの有効性確認
   - プロジェクトIDの設定確認

2. **モデル切り替え失敗**
   - 2.0 Flash-LiteにはプロジェクトIDが必要
   - エンドポイントの設定確認

3. **キャッシュ問題**
   - ブラウザのlocalStorageを確認
   - 期限切れキャッシュの自動削除

4. **ウィンドウ表示問題**
   - ブラウザの開発者ツールで確認
   - JavaScript エラーの確認

### デバッグ方法
- サーバーログの確認
- ブラウザのコンソールログ
- ネットワークタブでAPI通信確認
- キャッシュ管理パネルでキャッシュ状態確認

## 今後の発展

### 完了した主要機能
- ✅ 全6アプリの完全実装
- ✅ デュアルモデル対応
- ✅ UIキャッシュシステム
- ✅ パフォーマンス監視
- ✅ ウィンドウリサイズ機能
- ✅ ESCキーショートカット

### 短期目標
- モデル性能の継続的な比較分析
- プロンプトの細かな調整
- キャッシュ管理の最適化

### 長期目標
- 自然言語でのアプリリクエスト
- カスタムアプリの動的生成
- アプリ間連携
- テーマ・カスタマイズ機能

## 開発ガイドライン

### キャッシュ管理
1. 7日間のTTL設定
2. 最大50件のパフォーマンス記録
3. 10分間隔での自動クリーンアップ
4. ユーザーによる手動管理

### モデル切り替え
1. 2.5はグローバルエンドポイント
2. 2.0はリージョナルエンドポイント
3. リアルタイムパフォーマンス追跡
4. 統計情報の30秒間隔更新

### ウィンドウ管理
1. 最小サイズ: 200x150px
2. 画面境界の制限
3. ESCキーでの閉じる機能
4. 8方向リサイズ対応

### コード品質
1. シンプルで読みやすいコード
2. 適切なエラーハンドリング
3. コメントによる説明
4. 一貫したコーディングスタイル

---

**最終更新**: フェーズ2完了時（2025年1月18日）
**開発状況**: 全機能実装完了、本番レディ