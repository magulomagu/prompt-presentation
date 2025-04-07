// APIレスポンス処理ユーティリティ
const fs = require('fs');
const path = require('path');

/**
 * APIレスポンスからJSONデータを抽出して解析する関数
 * @param {string} content APIレスポンスの内容
 * @param {string} provider APIプロバイダー名（'openai'または'gemini'）
 * @returns {Object} 解析されたプレゼンテーションデータ
 */
function parseApiResponse(content, provider) {
  try {
    // JSONデータの抽出
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                      content.match(/```\n([\s\S]*?)\n```/) || 
                      content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('APIレスポンスからJSONデータを抽出できませんでした');
    }
    
    const jsonContent = jsonMatch[1] || jsonMatch[0];
    const presentationData = JSON.parse(jsonContent);
    
    // 必要なフィールドの検証と追加
    validateAndEnrichPresentationData(presentationData, provider);
    
    return presentationData;
  } catch (error) {
    console.error(`${provider} APIレスポンスの解析エラー:`, error);
    throw new Error('プレゼンテーションデータの解析に失敗しました');
  }
}

/**
 * プレゼンテーションデータを検証し、必要に応じて補完する関数
 * @param {Object} data プレゼンテーションデータ
 * @param {string} provider APIプロバイダー名
 */
function validateAndEnrichPresentationData(data, provider) {
  // 必須フィールドの検証
  if (!data.title) {
    data.title = 'プレゼンテーション';
  }
  
  if (!data.subtitle) {
    data.subtitle = provider === 'openai' ? 
      'OpenAI GPTで生成されたプレゼンテーション' : 
      'Gemini 2.5 Proで生成されたプレゼンテーション';
  }
  
  if (!data.date) {
    data.date = getCurrentDate();
  }
  
  if (!data.slides || !Array.isArray(data.slides) || data.slides.length === 0) {
    throw new Error('スライドデータが不正です');
  }
  
  // スライドの検証と補完
  data.slides.forEach((slide, index) => {
    if (!slide.type) {
      slide.type = 'content';
    }
    
    // スライドタイプに応じた検証
    switch (slide.type) {
      case 'title':
        if (!slide.title) slide.title = data.title;
        if (!slide.subtitle) slide.subtitle = data.subtitle;
        break;
        
      case 'bullet':
        if (!slide.title) slide.title = `スライド ${index + 1}`;
        if (!slide.points || !Array.isArray(slide.points)) {
          slide.points = ['ポイント1', 'ポイント2', 'ポイント3'];
        }
        break;
        
      case 'content':
        if (!slide.title) slide.title = `スライド ${index + 1}`;
        if (!slide.content) slide.content = '<p>コンテンツがここに表示されます</p>';
        break;
        
      case 'image':
        if (!slide.title) slide.title = `スライド ${index + 1}`;
        if (!slide.content) slide.content = '<p>画像の説明がここに表示されます</p>';
        break;
        
      case 'two-column':
        if (!slide.title) slide.title = `スライド ${index + 1}`;
        if (!slide.leftContent) slide.leftContent = '<p>左カラムのコンテンツ</p>';
        if (!slide.rightContent) slide.rightContent = '<p>右カラムのコンテンツ</p>';
        break;
        
      case 'quote':
        if (!slide.quote) slide.quote = '引用文がここに表示されます';
        if (!slide.author) slide.author = '著者名';
        break;
        
      case 'end':
        if (!slide.contactInfo) slide.contactInfo = 'ご質問やお問い合わせはこちらまで: example@example.com';
        break;
        
      default:
        // 不明なスライドタイプの場合はcontentに変換
        slide.type = 'content';
        if (!slide.title) slide.title = `スライド ${index + 1}`;
        if (!slide.content) slide.content = '<p>コンテンツがここに表示されます</p>';
    }
  });
  
  // スライドの順序を確認し、必要に応じて調整
  ensureSlideOrder(data);
}

/**
 * スライドの順序を確認し、必要に応じて調整する関数
 * @param {Object} data プレゼンテーションデータ
 */
function ensureSlideOrder(data) {
  const slides = data.slides;
  
  // 最初のスライドがタイトルスライドでない場合、追加する
  if (slides[0].type !== 'title') {
    slides.unshift({
      type: 'title',
      title: data.title,
      subtitle: data.subtitle
    });
  }
  
  // 最後のスライドが終了スライドでない場合、追加する
  if (slides[slides.length - 1].type !== 'end') {
    slides.push({
      type: 'end',
      contactInfo: 'ご質問やお問い合わせはこちらまで: example@example.com'
    });
  }
}

/**
 * 現在の日付を取得する関数
 * @returns {string} YYYY年MM月DD日形式の日付
 */
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

/**
 * APIレスポンスをログに記録する関数
 * @param {Object} data プレゼンテーションデータ
 * @param {string} provider APIプロバイダー名
 */
function logApiResponse(data, provider) {
  try {
    const logsDir = path.join(__dirname, 'logs');
    
    // logsディレクトリが存在しない場合は作成
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(logsDir, `${provider}-response-${timestamp}.json`);
    
    fs.writeFileSync(logFile, JSON.stringify(data, null, 2));
    console.log(`APIレスポンスをログに記録しました: ${logFile}`);
  } catch (error) {
    console.error('APIレスポンスのログ記録エラー:', error);
  }
}

/**
 * レート制限情報を追跡する簡易的なインメモリストア
 */
const rateLimitStore = {
  openai: {
    requestCount: 0,
    resetTime: Date.now() + 60000, // 1分後にリセット
    limit: 20 // 1分あたり20リクエスト
  },
  gemini: {
    requestCount: 0,
    resetTime: Date.now() + 60000, // 1分後にリセット
    limit: 30 // 1分あたり30リクエスト
  }
};

/**
 * レート制限をチェックする関数
 * @param {string} provider APIプロバイダー名
 * @returns {boolean} リクエストが許可されるかどうか
 */
function checkRateLimit(provider) {
  const now = Date.now();
  const store = rateLimitStore[provider];
  
  // リセット時間を過ぎている場合はカウンターをリセット
  if (now > store.resetTime) {
    store.requestCount = 0;
    store.resetTime = now + 60000; // 1分後にリセット
  }
  
  // リクエスト数が制限を超えている場合はfalseを返す
  if (store.requestCount >= store.limit) {
    return false;
  }
  
  // リクエスト数をインクリメント
  store.requestCount++;
  return true;
}

/**
 * レート制限情報を取得する関数
 * @param {string} provider APIプロバイダー名
 * @returns {Object} レート制限情報
 */
function getRateLimitInfo(provider) {
  const store = rateLimitStore[provider];
  const now = Date.now();
  
  return {
    remaining: Math.max(0, store.limit - store.requestCount),
    reset: Math.max(0, Math.ceil((store.resetTime - now) / 1000)),
    limit: store.limit
  };
}

module.exports = {
  parseApiResponse,
  validateAndEnrichPresentationData,
  getCurrentDate,
  logApiResponse,
  checkRateLimit,
  getRateLimitInfo
};
