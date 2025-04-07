// OpenAI APIを使用してプレゼンテーションを生成するAPIルート
import { OpenAI } from 'openai';
import { NextApiRequest, NextApiResponse } from 'next';

// 環境変数からAPIキーを取得
const apiKey = process.env.OPENAI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POSTリクエストのみを許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // リクエストボディからデータを取得
    const { prompt, slideCount, theme, style, detailLevel, languageStyle, slideStructure, tags } = req.body;

    // APIキーが設定されているか確認
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    // OpenAIクライアントを初期化
    const openai = new OpenAI({ apiKey });

    // プロンプトを構築
    const systemPrompt = `あなたはプレゼンテーション作成の専門家です。以下の要件に基づいて、${slideCount}枚のスライドからなるプレゼンテーションを作成してください。
    テーマ: ${theme || 'モダン'}
    スタイル: ${style || 'プロフェッショナル'}
    詳細度: ${detailLevel || 'バランス'}
    言語スタイル: ${languageStyle || '標準'}
    スライド構成: ${slideStructure || '自動'}
    タグ: ${tags ? tags.join(', ') : ''}
    
    以下のJSON形式で出力してください:
    {
      "title": "プレゼンテーションのタイトル",
      "subtitle": "サブタイトル（あれば）",
      "author": "作成者（あれば）",
      "slides": [
        {
          "type": "title", // title, content, bullets, image, quote, twoColumn, final など
          "title": "スライドのタイトル",
          "content": "スライドの内容",
          "notes": "発表者ノート（あれば）"
        },
        // 残りのスライド
      ]
    }`;

    // OpenAI APIを呼び出し
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    // レスポンスを解析
    const responseText = completion.choices[0].message.content;
    let presentationData;
    
    try {
      presentationData = JSON.parse(responseText);
    } catch (error) {
      // JSONパースに失敗した場合、テキスト形式で返す
      return res.status(200).json({ 
        raw: responseText,
        error: 'Failed to parse JSON response'
      });
    }

    // 成功レスポンスを返す
    return res.status(200).json(presentationData);
  } catch (error) {
    console.error('Error generating presentation:', error);
    return res.status(500).json({ error: 'Failed to generate presentation' });
  }
}
