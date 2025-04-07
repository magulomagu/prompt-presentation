// サーバーサイドAPI機能のテスト
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// テスト設定
const BASE_URL = 'http://localhost:5000/api';
const TEST_OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const TEST_GEMINI_KEY = process.env.GEMINI_API_KEY || '';

// テスト実行関数
async function runTests() {
  console.log('サーバーサイドAPI機能テストを開始します...');
  
  try {
    // サーバー状態確認テスト
    await testServerStatus();
    
    // APIキー設定テスト
    if (TEST_OPENAI_KEY) {
      await testSetApiKey('openai', TEST_OPENAI_KEY);
    } else {
      console.log('OpenAI APIキーが設定されていないため、テストをスキップします');
    }
    
    if (TEST_GEMINI_KEY) {
      await testSetApiKey('gemini', TEST_GEMINI_KEY);
    } else {
      console.log('Gemini APIキーが設定されていないため、テストをスキップします');
    }
    
    // APIキー検証テスト
    if (TEST_OPENAI_KEY) {
      await testValidateApiKey('openai', TEST_OPENAI_KEY);
    }
    
    if (TEST_GEMINI_KEY) {
      await testValidateApiKey('gemini', TEST_GEMINI_KEY);
    }
    
    // プレゼンテーション生成テスト
    if (TEST_OPENAI_KEY) {
      await testGeneratePresentation('openai');
    }
    
    if (TEST_GEMINI_KEY) {
      await testGeneratePresentation('gemini');
    }
    
    console.log('すべてのテストが成功しました！');
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error.message);
    if (error.response) {
      console.error('レスポンスデータ:', error.response.data);
    }
  }
}

// サーバー状態確認テスト
async function testServerStatus() {
  console.log('サーバー状態確認テスト...');
  
  try {
    const response = await axios.get(`${BASE_URL}/status`);
    
    if (response.data.success) {
      console.log('✅ サーバー状態確認テスト成功:', response.data);
    } else {
      throw new Error('サーバー状態確認に失敗しました');
    }
  } catch (error) {
    console.error('❌ サーバー状態確認テスト失敗:', error.message);
    throw error;
  }
}

// APIキー設定テスト
async function testSetApiKey(provider, apiKey) {
  console.log(`${provider} APIキー設定テスト...`);
  
  try {
    const response = await axios.post(`${BASE_URL}/set-api-key`, {
      provider,
      apiKey
    });
    
    if (response.data.success) {
      console.log(`✅ ${provider} APIキー設定テスト成功:`, response.data.message);
    } else {
      throw new Error(`${provider} APIキー設定に失敗しました`);
    }
  } catch (error) {
    console.error(`❌ ${provider} APIキー設定テスト失敗:`, error.message);
    throw error;
  }
}

// APIキー検証テスト
async function testValidateApiKey(provider, apiKey) {
  console.log(`${provider} APIキー検証テスト...`);
  
  try {
    const response = await axios.post(`${BASE_URL}/validate-api-key`, {
      provider,
      apiKey
    });
    
    if (response.data.success) {
      console.log(`✅ ${provider} APIキー検証テスト成功:`, response.data.message);
    } else {
      throw new Error(`${provider} APIキー検証に失敗しました`);
    }
  } catch (error) {
    console.error(`❌ ${provider} APIキー検証テスト失敗:`, error.message);
    throw error;
  }
}

// プレゼンテーション生成テスト
async function testGeneratePresentation(model) {
  console.log(`${model} プレゼンテーション生成テスト...`);
  
  try {
    const response = await axios.post(`${BASE_URL}/presentation/generate`, {
      prompt: 'AIの歴史と未来について5枚のスライドを作成',
      slideCount: 5,
      theme: 'modern',
      presentationStyle: 'professional',
      contentDepth: 'balanced',
      languageStyle: 'standard',
      slideStructure: 'auto',
      tags: ['AI', '歴史', '未来'],
      model
    });
    
    if (response.data.success) {
      console.log(`✅ ${model} プレゼンテーション生成テスト成功:`, 
        `タイトル: ${response.data.data.title}, ` +
        `スライド数: ${response.data.data.slides.length}`);
    } else {
      throw new Error(`${model} プレゼンテーション生成に失敗しました`);
    }
  } catch (error) {
    console.error(`❌ ${model} プレゼンテーション生成テスト失敗:`, error.message);
    throw error;
  }
}

// テスト実行
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testServerStatus,
  testSetApiKey,
  testValidateApiKey,
  testGeneratePresentation
};
