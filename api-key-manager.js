// サーバーサイドAPIキー管理
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// APIキーを保存するファイルのパス
const API_KEYS_FILE = path.join(__dirname, '../config/api_keys.json');
const API_KEYS_DIR = path.join(__dirname, '../config');

// 暗号化のための秘密鍵（実際の環境では環境変数から取得するべき）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-min-32-chars';
const ENCRYPTION_IV = crypto.randomBytes(16);

// APIキーの暗号化
function encryptApiKey(apiKey) {
  try {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), ENCRYPTION_IV);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      iv: ENCRYPTION_IV.toString('hex'),
      encryptedData: encrypted
    };
  } catch (error) {
    console.error('APIキー暗号化エラー:', error);
    throw new Error('APIキーの暗号化に失敗しました');
  }
}

// APIキーの復号化
function decryptApiKey(encryptedData, iv) {
  try {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      Buffer.from(ENCRYPTION_KEY), 
      Buffer.from(iv, 'hex')
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('APIキー復号化エラー:', error);
    throw new Error('APIキーの復号化に失敗しました');
  }
}

// APIキーの保存
async function saveApiKeys(openaiKey, geminiKey) {
  try {
    // configディレクトリが存在しない場合は作成
    if (!fs.existsSync(API_KEYS_DIR)) {
      fs.mkdirSync(API_KEYS_DIR, { recursive: true });
    }
    
    const apiKeys = {
      openai: openaiKey ? encryptApiKey(openaiKey) : null,
      gemini: geminiKey ? encryptApiKey(geminiKey) : null
    };
    
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(apiKeys, null, 2));
    return true;
  } catch (error) {
    console.error('APIキー保存エラー:', error);
    return false;
  }
}

// APIキーの読み込み
async function loadApiKeys() {
  try {
    if (!fs.existsSync(API_KEYS_FILE)) {
      return { openaiKey: '', geminiKey: '' };
    }
    
    const apiKeysData = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));
    
    let openaiKey = '';
    let geminiKey = '';
    
    if (apiKeysData.openai) {
      openaiKey = decryptApiKey(
        apiKeysData.openai.encryptedData,
        apiKeysData.openai.iv
      );
    }
    
    if (apiKeysData.gemini) {
      geminiKey = decryptApiKey(
        apiKeysData.gemini.encryptedData,
        apiKeysData.gemini.iv
      );
    }
    
    return { openaiKey, geminiKey };
  } catch (error) {
    console.error('APIキー読み込みエラー:', error);
    return { openaiKey: '', geminiKey: '' };
  }
}

// APIキーの削除
async function deleteApiKey(provider) {
  try {
    if (!fs.existsSync(API_KEYS_FILE)) {
      return false;
    }
    
    const apiKeysData = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));
    
    if (provider === 'openai') {
      apiKeysData.openai = null;
    } else if (provider === 'gemini') {
      apiKeysData.gemini = null;
    } else {
      return false;
    }
    
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(apiKeysData, null, 2));
    return true;
  } catch (error) {
    console.error('APIキー削除エラー:', error);
    return false;
  }
}

// APIキーの検証
async function validateApiKey(provider, apiKey) {
  try {
    // APIキーチェック
    if (!apiKey) {
      return {
        success: false,
        message: 'APIキーが設定されていません'
      };
    }
    
    // 形式チェック
    let isValid = false;
    if (provider === 'openai') {
      isValid = apiKey.startsWith('sk-');
    } else if (provider === 'gemini') {
      isValid = apiKey.startsWith('AIzaSy');
    } else {
      return {
        success: false,
        message: 'サポートされていないプロバイダーです'
      };
    }
    
    if (!isValid) {
      return {
        success: false,
        message: `${provider === 'openai' ? 'OpenAI' : 'Gemini'} APIキーの形式が正しくありません`
      };
    }
    
    // 実際のAPIコールで検証する場合はここに追加
    
    return {
      success: true,
      message: 'APIキーの形式が正しいです'
    };
  } catch (error) {
    console.error('APIキー検証エラー:', error);
    return {
      success: false,
      message: 'APIキー検証中にエラーが発生しました',
      error: error.message
    };
  }
}

// 初期化時にAPIキーを読み込む
async function initApiKeys() {
  try {
    const { openaiKey, geminiKey } = await loadApiKeys();
    return { openaiKey, geminiKey };
  } catch (error) {
    console.error('APIキー初期化エラー:', error);
    return { openaiKey: '', geminiKey: '' };
  }
}

module.exports = {
  saveApiKeys,
  loadApiKeys,
  deleteApiKey,
  validateApiKey,
  initApiKeys
};
