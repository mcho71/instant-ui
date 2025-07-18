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
  const { appType, context, model } = req.body;
  
  try {
    // Vertex AIでUI生成を試行
    const aiResponse = await vertexAI.generateUI(appType, context, model);
    
    res.json({ success: true, data: aiResponse });
  } catch (error) {
    console.error('Error generating UI:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      appType: appType,
      context: context,
      model: model
    });
    
    // エラー時はエラーレスポンスを返す
    res.json({ success: false, error: error.message });
  }
});

// モデル情報取得エンドポイント
app.get('/api/models', (req, res) => {
  try {
    const models = vertexAI.getAvailableModels();
    const currentModel = vertexAI.getCurrentModel();
    
    res.json({ 
      success: true, 
      data: {
        available: models,
        current: currentModel
      }
    });
  } catch (error) {
    console.error('Error getting models:', error);
    res.json({ success: false, error: error.message });
  }
});

// モデル変更エンドポイント
app.post('/api/models/switch', (req, res) => {
  const { model } = req.body;
  
  try {
    vertexAI.setModel(model);
    const currentModel = vertexAI.getCurrentModel();
    
    res.json({ 
      success: true, 
      data: {
        current: currentModel
      }
    });
  } catch (error) {
    console.error('Error switching model:', error);
    res.json({ success: false, error: error.message });
  }
});

// パフォーマンス統計エンドポイント
app.get('/api/performance', (req, res) => {
  try {
    const stats = vertexAI.getPerformanceStats();
    
    res.json({ 
      success: true, 
      data: stats
    });
  } catch (error) {
    console.error('Error getting performance stats:', error);
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