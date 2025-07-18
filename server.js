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

// テスト用のモックレスポンス
function getMockResponse(appType) {
  const mockResponses = {
    calculator: {
      html: `
        <div class="p-4 bg-gray-50 h-full">
          <div class="bg-black text-white text-right p-4 mb-4 rounded text-2xl font-mono">
            0
          </div>
          <div class="grid grid-cols-4 gap-2">
            <button class="bg-red-500 text-white p-3 rounded hover:bg-red-600">C</button>
            <button class="bg-red-500 text-white p-3 rounded hover:bg-red-600">AC</button>
            <button class="bg-blue-500 text-white p-3 rounded hover:bg-blue-600">÷</button>
            <button class="bg-blue-500 text-white p-3 rounded hover:bg-blue-600">×</button>
            
            <button class="bg-gray-200 text-black p-3 rounded hover:bg-gray-300">7</button>
            <button class="bg-gray-200 text-black p-3 rounded hover:bg-gray-300">8</button>
            <button class="bg-gray-200 text-black p-3 rounded hover:bg-gray-300">9</button>
            <button class="bg-blue-500 text-white p-3 rounded hover:bg-blue-600">-</button>
            
            <button class="bg-gray-200 text-black p-3 rounded hover:bg-gray-300">4</button>
            <button class="bg-gray-200 text-black p-3 rounded hover:bg-gray-300">5</button>
            <button class="bg-gray-200 text-black p-3 rounded hover:bg-gray-300">6</button>
            <button class="bg-blue-500 text-white p-3 rounded hover:bg-blue-600">+</button>
            
            <button class="bg-gray-200 text-black p-3 rounded hover:bg-gray-300">1</button>
            <button class="bg-gray-200 text-black p-3 rounded hover:bg-gray-300">2</button>
            <button class="bg-gray-200 text-black p-3 rounded hover:bg-gray-300">3</button>
            <button class="bg-green-500 text-white p-3 rounded hover:bg-green-600 row-span-2">=</button>
            
            <button class="bg-gray-200 text-black p-3 rounded hover:bg-gray-300 col-span-2">0</button>
            <button class="bg-gray-200 text-black p-3 rounded hover:bg-gray-300">.</button>
          </div>
        </div>
      `,
      script: `
        const display = windowContent.querySelector('div > div');
        let currentInput = '0';
        let operator = null;
        let previousInput = null;
        
        function updateDisplay() {
          display.textContent = currentInput;
        }
        
        windowContent.addEventListener('click', (e) => {
          if (e.target.tagName === 'BUTTON') {
            const value = e.target.textContent;
            
            if (value >= '0' && value <= '9') {
              currentInput = currentInput === '0' ? value : currentInput + value;
              updateDisplay();
            } else if (value === 'C') {
              currentInput = '0';
              updateDisplay();
            } else if (value === 'AC') {
              currentInput = '0';
              operator = null;
              previousInput = null;
              updateDisplay();
            } else if (['+', '-', '×', '÷'].includes(value)) {
              if (operator && previousInput !== null) {
                calculate();
              }
              operator = value;
              previousInput = currentInput;
              currentInput = '0';
            } else if (value === '=') {
              calculate();
            } else if (value === '.') {
              if (!currentInput.includes('.')) {
                currentInput += '.';
                updateDisplay();
              }
            }
          }
        });
        
        function calculate() {
          if (operator && previousInput !== null) {
            const prev = parseFloat(previousInput);
            const curr = parseFloat(currentInput);
            let result;
            
            switch (operator) {
              case '+': result = prev + curr; break;
              case '-': result = prev - curr; break;
              case '×': result = prev * curr; break;
              case '÷': result = curr !== 0 ? prev / curr : 'Error'; break;
              default: return;
            }
            
            currentInput = result.toString();
            operator = null;
            previousInput = null;
            updateDisplay();
          }
        }
      `,
      styles: '',
      metadata: {
        title: '電卓',
        defaultSize: { width: 320, height: 480 }
      }
    }
  };
  
  return mockResponses[appType] || {
    html: '<div class="p-4">このアプリは準備中です</div>',
    script: '',
    styles: '',
    metadata: { title: 'アプリ', defaultSize: { width: 300, height: 200 } }
  };
}

// APIエンドポイント
app.post('/api/generate-ui', async (req, res) => {
  try {
    const { appType, context } = req.body;
    
    // Vertex AIでUI生成を試行
    const aiResponse = await vertexAI.generateUI(appType, context);
    
    res.json({ success: true, data: aiResponse });
  } catch (error) {
    console.error('Error generating UI:', error);
    
    // エラー時はモックレスポンスを使用
    console.log('Using mock response for:', appType);
    const mockResponse = getMockResponse(appType);
    
    res.json({ success: true, data: mockResponse });
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