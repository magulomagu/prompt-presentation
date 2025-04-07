require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// APIキーの設定
let openaiApiKey = process.env.OPENAI_API_KEY || '';
let geminiApiKey = process.env.GEMINI_API_KEY || '';

// OpenAI クライアント初期化関数
function getOpenAIClient() {
  if (!openaiApiKey) {
    throw new Error('OpenAI APIキーが設定されていません');
  }
  return new OpenAI({
    apiKey: openaiApiKey
  });
}

// Gemini クライアント初期化関数
function getGeminiClient() {
  if (!geminiApiKey) {
    throw new Error('Gemini APIキーが設定されていません');
  }
  return new GoogleGenerativeAI(geminiApiKey);
}

// APIキー設定エンドポイント
app.post('/api/set-api-key', (req, res) => {
  try {
    const { provider, apiKey } = req.body;
    
    if (!provider || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'プロバイダーとAPIキーが必要です'
      });
    }
    
    // APIキーの形式チェック
    let isValid = false;
    if (provider === 'openai') {
      isValid = apiKey.startsWith('sk-');
      if (isValid) {
        openaiApiKey = apiKey;
      }
    } else if (provider === 'gemini') {
      isValid = apiKey.startsWith('AIzaSy');
      if (isValid) {
        geminiApiKey = apiKey;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'サポートされていないプロバイダーです'
      });
    }
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: `${provider === 'openai' ? 'OpenAI' : 'Gemini'} APIキーの形式が正しくありません`
      });
    }
    
    // APIキーの検証（実際のAPIコールは行わない）
    res.json({
      success: true,
      message: `${provider === 'openai' ? 'OpenAI' : 'Gemini'} APIキーが設定されました`
    });
  } catch (error) {
    console.error('APIキー設定エラー:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error.message
    });
  }
});

// APIキー検証エンドポイント
app.post('/api/validate-api-key', async (req, res) => {
  try {
    const { provider, apiKey } = req.body;
    
    if (!provider || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'プロバイダーとAPIキーが必要です'
      });
    }
    
    // APIキーの形式チェック
    let isValid = false;
    if (provider === 'openai') {
      isValid = apiKey.startsWith('sk-');
      // 実際のAPIコールで検証する場合はここに追加
    } else if (provider === 'gemini') {
      isValid = apiKey.startsWith('AIzaSy');
      // 実際のAPIコールで検証する場合はここに追加
    } else {
      return res.status(400).json({
        success: false,
        message: 'サポートされていないプロバイダーです'
      });
    }
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: `${provider === 'openai' ? 'OpenAI' : 'Gemini'} APIキーの形式が正しくありません`
      });
    }
    
    res.json({
      success: true,
      message: 'APIキーの形式が正しいです'
    });
  } catch (error) {
    console.error('APIキー検証エラー:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error.message
    });
  }
});

// プレゼンテーション生成エンドポイント
app.post('/api/generate-presentation', async (req, res) => {
  try {
    const { prompt, slideCount, theme, presentationStyle, contentDepth, languageStyle, slideStructure, tags, model } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'プロンプトが必要です'
      });
    }
    
    // モデルに応じたAPIキーチェック
    if (model === 'openai' && !openaiApiKey) {
      return res.status(400).json({
        success: false,
        message: 'OpenAI APIキーが設定されていません'
      });
    } else if (model === 'gemini' && !geminiApiKey) {
      return res.status(400).json({
        success: false,
        message: 'Gemini APIキーが設定されていません'
      });
    }
    
    // プレゼンテーション生成
    let presentationData;
    if (model === 'openai') {
      presentationData = await generateWithOpenAI(prompt, slideCount, theme, presentationStyle, contentDepth, languageStyle, slideStructure, tags);
    } else if (model === 'gemini') {
      presentationData = await generateWithGemini(prompt, slideCount, theme, presentationStyle, contentDepth, languageStyle, slideStructure, tags);
    } else {
      return res.status(400).json({
        success: false,
        message: 'サポートされていないモデルです'
      });
    }
    
    res.json({
      success: true,
      data: presentationData
    });
  } catch (error) {
    console.error('プレゼンテーション生成エラー:', error);
    res.status(500).json({
      success: false,
      message: 'プレゼンテーション生成中にエラーが発生しました',
      error: error.message
    });
  }
});

// OpenAI APIを使用してプレゼンテーションを生成
async function generateWithOpenAI(prompt, slideCount, theme, presentationStyle, contentDepth, languageStyle, slideStructure, tags) {
  try {
    const openai = getOpenAIClient();
    
    // プロンプトの構築
    const systemPrompt = `あなたはプレゼンテーション資料を作成する専門家です。
以下の条件に基づいて、HTML形式のプレゼンテーションスライドを生成してください。

- スライド枚数: ${slideCount}枚
- デザインテーマ: ${theme}
- プレゼンテーションスタイル: ${presentationStyle}
- 内容の詳細度: ${contentDepth}
- 言語スタイル: ${languageStyle}
- スライド構成: ${slideStructure}
- キーワード/タグ: ${tags.join(', ')}

各スライドは以下のHTML構造で生成してください:
\`\`\`html
<div class="slide-title">スライドタイトル</div>
<div class="slide-content">
  <!-- スライドの内容 -->
</div>
\`\`\`

最初のスライドはタイトルスライド、2枚目は目次、最後のスライドはまとめとしてください。
それぞれのスライドには適切な見出し、段落、リスト、引用などを含めてください。`;

    const userPrompt = prompt;
    
    // OpenAI APIを呼び出し
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });
    
    // レスポンスの解析
    const content = response.choices[0].message.content;
    
    // スライドの抽出と整形
    return processGeneratedContent(content, prompt, slideCount, theme);
  } catch (error) {
    console.error('OpenAI API エラー:', error);
    throw new Error(`OpenAI API エラー: ${error.message}`);
  }
}

// Gemini APIを使用してプレゼンテーションを生成
async function generateWithGemini(prompt, slideCount, theme, presentationStyle, contentDepth, languageStyle, slideStructure, tags) {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // プロンプトの構築
    const systemPrompt = `あなたはプレゼンテーション資料を作成する専門家です。
以下の条件に基づいて、HTML形式のプレゼンテーションスライドを生成してください。

- スライド枚数: ${slideCount}枚
- デザインテーマ: ${theme}
- プレゼンテーションスタイル: ${presentationStyle}
- 内容の詳細度: ${contentDepth}
- 言語スタイル: ${languageStyle}
- スライド構成: ${slideStructure}
- キーワード/タグ: ${tags.join(', ')}

各スライドは以下のHTML構造で生成してください:
\`\`\`html
<div class="slide-title">スライドタイトル</div>
<div class="slide-content">
  <!-- スライドの内容 -->
</div>
\`\`\`

最初のスライドはタイトルスライド、2枚目は目次、最後のスライドはまとめとしてください。
それぞれのスライドには適切な見出し、段落、リスト、引用などを含めてください。`;

    const userPrompt = prompt;
    
    // Gemini APIを呼び出し
    const result = await model.generateContent([
      systemPrompt,
      userPrompt
    ]);
    const response = await result.response;
    const content = response.text();
    
    // スライドの抽出と整形
    return processGeneratedContent(content, prompt, slideCount, theme);
  } catch (error) {
    console.error('Gemini API エラー:', error);
    throw new Error(`Gemini API エラー: ${error.message}`);
  }
}

// 生成されたコンテンツを処理してスライドに変換
function processGeneratedContent(content, prompt, slideCount, theme) {
  try {
    // タイトルの抽出
    const titleMatch = prompt.match(/(.+?)(?:について|に関する|の|$)/);
    const title = titleMatch ? titleMatch[1] : prompt.split(' ').slice(0, 5).join(' ');
    
    // スライドの抽出
    const slideMatches = content.match(/<div class="slide-title">(.+?)<\/div>\s*<div class="slide-content">([\s\S]+?)<\/div>/g);
    
    let slides = [];
    
    // マッチしたスライドがない場合はダミーデータを生成
    if (!slideMatches || slideMatches.length === 0) {
      return generateDummyPresentation(prompt, parseInt(slideCount), theme);
    }
    
    // スライドの処理
    slideMatches.forEach((slideMatch, index) => {
      const slideContent = slideMatch;
      
      slides.push({
        type: index === 0 ? 'title' : (index === 1 ? 'toc' : `content-${index % 4}`),
        content: slideContent
      });
    });
    
    // スライド数の調整
    const targetSlideCount = parseInt(slideCount);
    if (slides.length < targetSlideCount) {
      // 足りない場合はダミースライドを追加
      const dummyPresentation = generateDummyPresentation(prompt, targetSlideCount, theme);
      slides = slides.concat(dummyPresentation.slides.slice(slides.length));
    } else if (slides.length > targetSlideCount) {
      // 多い場合は切り詰め（ただし最初と最後は保持）
      const firstSlide = slides[0];
      const lastSlides = slides.slice(-1);
      const middleSlides = slides.slice(1, -1).slice(0, targetSlideCount - 2);
      slides = [firstSlide, ...middleSlides, ...lastSlides];
    }
    
    return {
      title: title,
      slideCount: slides.length,
      theme: theme,
      slides: slides
    };
  } catch (error) {
    console.error('コンテンツ処理エラー:', error);
    return generateDummyPresentation(prompt, parseInt(slideCount), theme);
  }
}

// ダミープレゼンテーションデータの生成
function generateDummyPresentation(prompt, slideCount, theme) {
  const title = prompt.split(' ').slice(0, 5).join(' ');
  const slides = [];
  
  // タイトルスライド
  slides.push({
    type: 'title',
    content: `
      <div class="slide-title">${title}</div>
      <div class="slide-content">
        <p>Generated from prompt: ${prompt}</p>
      </div>
      <div class="slide-footer">
        <p>Created with Manus AI</p>
      </div>
    `
  });
  
  // 目次スライド
  slides.push({
    type: 'toc',
    content: `
      <div class="slide-title">目次</div>
      <div class="slide-content">
        <ol>
          <li>はじめに</li>
          <li>主要なポイント</li>
          <li>詳細分析</li>
          <li>事例紹介</li>
          <li>まとめと結論</li>
        </ol>
      </div>
    `
  });
  
  // コンテンツスライド
  for (let i = 2; i < slideCount; i++) {
    const slideType = i % 4;
    let slideContent = '';
    
    switch (slideType) {
      case 0:
        // テキストスライド
        slideContent = `
          <div class="slide-title">セクション ${i-1}</div>
          <div class="slide-content">
            <p>このスライドには、プロンプトに基づいて生成されたテキストコンテンツが含まれます。</p>
            <p>実際のAPIを使用すると、ここに意味のあるコンテンツが生成されます。</p>
            <p>現在はダミーデータを表示しています。</p>
          </div>
        `;
        break;
      case 1:
        // 箇条書きスライド
        slideContent = `
          <div class="slide-title">重要なポイント</div>
          <div class="slide-content">
            <ul>
              <li>第一のポイント: 重要な情報</li>
              <li>第二のポイント: 詳細な分析</li>
              <li>第三のポイント: 具体的な例</li>
              <li>第四のポイント: 実践的なアドバイス</li>
            </ul>
          </div>
        `;
        break;
      case 2:
        // 2カラムスライド
        slideContent = `
          <div class="slide-title">比較分析</div>
          <div class="slide-content" style="display: flex; gap: 20px;">
            <div style="flex: 1;">
              <h3>左側の内容</h3>
              <p>ここには左側のコンテンツが入ります。</p>
              <p>比較対象の詳細情報などを記載します。</p>
            </div>
            <div style="flex: 1;">
              <h3>右側の内容</h3>
              <p>ここには右側のコンテンツが入ります。</p>
              <p>比較対象の詳細情報などを記載します。</p>
            </div>
          </div>
        `;
        break;
      case 3:
        // 引用スライド
        slideContent = `
          <div class="slide-title">引用と参考情報</div>
          <div class="slide-content">
            <blockquote style="font-style: italic; border-left: 4px solid #ccc; padding-left: 20px;">
              "これは引用テキストのサンプルです。実際のAPIを使用すると、プロンプトに関連する意味のある引用が生成されます。"
            </blockquote>
            <p style="text-align: right;">— 引用元</p>
          </div>
        `;
        break;
    }
    
    slides.push({
      type: `content-${slideType}`,
      content: slideContent
    });
  }
  
  // 最終スライド
  slides.push({
    type: 'end',
    content: `
      <div class="slide-title">ご清聴ありがとうございました</div>
      <div class="slide-content">
        <p style="text-align: center; font-size: 1.2em;">質問やフィードバックをお待ちしています</p>
      </div>
      <div class="slide-footer">
        <p>Created with Manus AI</p>
      </div>
    `
  });
  
  return {
    title: title,
    slideCount: slides.length,
    theme: theme,
    slides: slides
  };
}

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
  console.log(`OpenAI APIキー: ${openaiApiKey ? '設定済み' : '未設定'}`);
  console.log(`Gemini APIキー: ${geminiApiKey ? '設定済み' : '未設定'}`);
});
