const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const VertexAIClient = require('./src/vertex-ai');

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const vertexAI = new VertexAIClient();

// ミドルウェア
app.use(express.json());
app.use(express.static('public'));

// APIエンドポイント
app.post('/api/generate-ui', async (req, res) => {
  try {
    const { appType, context } = req.body;
    
    // Vertex AIでUI生成
    const aiResponse = await vertexAI.generateUI(appType, context);
    
    res.json({ success: true, data: aiResponse });
  } catch (error) {
    console.error('Error generating UI:', error);
    
    // エラー時はフォールバック
    const fallbackResponse = {
      html: `<div class="p-4 text-center text-gray-600">
        <p class="mb-2">AI生成に失敗しました</p>
        <p class="text-sm">${error.message}</p>
      </div>`,
      script: '',
      styles: '',
      metadata: {
        title: appType,
        defaultSize: { width: 400, height: 300 }
      }
    };
    
    res.json({ success: true, data: fallbackResponse });
  }
});

// ルートパス
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Environment:', {
    projectId: process.env.VERTEX_AI_PROJECT_ID ? 'Set' : 'Not set',
    location: process.env.VERTEX_AI_LOCATION || 'Not set',
    token: process.env.VERTEX_AI_ACCESS_TOKEN ? 'Set' : 'Not set'
  });
});