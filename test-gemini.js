// Gemini API統合のテスト用スクリプト
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// APIキーの取得（.envファイルから）
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('Gemini APIキーが設定されていません。.envファイルにGEMINI_API_KEYを設定してください。');
  process.exit(1);
}

// Geminiクライアントの初期化
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// テスト用のプロンプト
const geminiPrompt = `あなたはプレゼンテーション資料を生成する専門家です。
ユーザーのプロンプトに基づいて、5枚のスライドで構成されるプレゼンテーション資料を生成してください。

以下の条件でプレゼンテーション資料を生成してください：

テーマ: AIの歴史と未来
スライド枚数: 5枚
プレゼンテーションスタイル: professional
内容の詳細度: balanced
言語スタイル: standard

以下の形式でJSONデータを返してください。他の説明は不要です。JSONデータのみを返してください。

出力形式:
\`\`\`json
{
  "title": "プレゼンテーションのタイトル",
  "subtitle": "サブタイトル",
  "date": "作成日（YYYY年MM月DD日形式）",
  "slides": [
    {
      "type": "title",
      "title": "タイトル",
      "subtitle": "サブタイトル"
    },
    {
      "type": "bullet",
      "title": "箇条書きスライドのタイトル",
      "points": ["ポイント1", "ポイント2", "ポイント3"]
    },
    {
      "type": "content",
      "title": "コンテンツスライドのタイトル",
      "content": "HTMLフォーマットのコンテンツ"
    },
    {
      "type": "quote",
      "quote": "引用文",
      "author": "著者名"
    },
    {
      "type": "end",
      "contactInfo": "連絡先情報"
    }
  ]
}
\`\`\`

スライドの種類と内容のバランスを考慮してください。各スライドには適切なタイトルをつけ、内容は具体的かつ情報量が豊富になるようにしてください。コンテンツはHTML形式で記述し、<p>、<ul>、<li>、<strong>、<em>などのタグを適切に使用してください。`;

// Gemini APIを呼び出す関数
async function testGeminiAPI() {
  try {
    console.log('Gemini APIテスト開始...');
    
    // APIリクエスト
    const result = await model.generateContent(geminiPrompt);
    const response = await result.response;
    const content = response.text();
    
    console.log('APIレスポンス:', content);
    
    // JSONデータの抽出
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                      content.match(/```\n([\s\S]*?)\n```/) || 
                      content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonContent = jsonMatch[1] || jsonMatch[0];
      try {
        const presentationData = JSON.parse(jsonContent);
        console.log('解析されたプレゼンテーションデータ:', JSON.stringify(presentationData, null, 2));
        console.log('Gemini APIテスト成功!');
      } catch (parseError) {
        console.error('JSONの解析に失敗しました:', parseError);
      }
    } else {
      console.error('APIレスポンスからJSONデータを抽出できませんでした');
    }
  } catch (error) {
    console.error('Gemini APIテストエラー:', error);
  }
}

// テスト実行
testGeminiAPI();
