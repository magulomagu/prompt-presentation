// OpenAI API統合のテスト用スクリプト
require('dotenv').config();
const { OpenAI } = require('openai');

// APIキーの取得（.envファイルから）
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('OpenAI APIキーが設定されていません。.envファイルにOPENAI_API_KEYを設定してください。');
  process.exit(1);
}

// OpenAIクライアントの初期化
const openai = new OpenAI({ apiKey });

// テスト用のプロンプト
const systemPrompt = `あなたはプレゼンテーション資料を生成する専門家です。
ユーザーのプロンプトに基づいて、5枚のスライドで構成されるプレゼンテーション資料を生成してください。
以下の形式でJSONデータを返してください。

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

スライドの種類と内容のバランスを考慮してください。`;

const userPrompt = `以下の条件でプレゼンテーション資料を生成してください：

テーマ: AIの歴史と未来
スライド枚数: 5枚
プレゼンテーションスタイル: professional
内容の詳細度: balanced
言語スタイル: standard

各スライドには適切なタイトルをつけ、内容は具体的かつ情報量が豊富になるようにしてください。
スライドの種類（タイトル、箇条書き、コンテンツ、引用、終了）をバランスよく使用してください。
コンテンツはHTML形式で記述し、<p>、<ul>、<li>、<strong>、<em>などのタグを適切に使用してください。`;

// OpenAI APIを呼び出す関数
async function testOpenAIAPI() {
  try {
    console.log('OpenAI APIテスト開始...');
    
    // APIリクエスト
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });
    
    // レスポンスの取得
    const content = response.choices[0].message.content;
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
        console.log('OpenAI APIテスト成功!');
      } catch (parseError) {
        console.error('JSONの解析に失敗しました:', parseError);
      }
    } else {
      console.error('APIレスポンスからJSONデータを抽出できませんでした');
    }
  } catch (error) {
    console.error('OpenAI APIテストエラー:', error);
  }
}

// テスト実行
testOpenAIAPI();
