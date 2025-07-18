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
  const { appType, context } = req.body;
  
  try {
    // Vertex AIでUI生成を試行
    const aiResponse = await vertexAI.generateUI(appType, context);
    
    res.json({ success: true, data: aiResponse });
  } catch (error) {
    console.error('Error generating UI:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      appType: appType,
      context: context
    });
    
    // エラー時はエラーレスポンスを返す
    res.json({ success: false, error: error.message });
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
    googleAIApiKey: process.env.GOOGLE_AI_API_KEY ? 'Set' : 'Not set'
  });
});