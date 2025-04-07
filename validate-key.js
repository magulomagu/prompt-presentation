// APIキー検証用のAPIルート
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POSTリクエストのみを許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // リクエストボディからデータを取得
    const { apiKey, model } = req.body;

    // APIキーが提供されているか確認
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // モデルタイプに基づいて検証
    if (model === 'openai') {
      // OpenAIキーの検証
      try {
        const openai = new OpenAI({ apiKey });
        const models = await openai.models.list();
        return res.status(200).json({ valid: true, message: 'OpenAI API key is valid' });
      } catch (error) {
        console.error('OpenAI API key validation error:', error);
        return res.status(400).json({ valid: false, error: 'Invalid OpenAI API key' });
      }
    } else if (model === 'gemini') {
      // Geminiキーの検証
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const result = await model.generateContent('Hello');
        return res.status(200).json({ valid: true, message: 'Gemini API key is valid' });
      } catch (error) {
        console.error('Gemini API key validation error:', error);
        return res.status(400).json({ valid: false, error: 'Invalid Gemini API key' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid model type' });
    }
  } catch (error) {
    console.error('Error validating API key:', error);
    return res.status(500).json({ error: 'Failed to validate API key' });
  }
}
