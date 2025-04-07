// PNG形式でのエクスポートを行うAPIエンドポイント
import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // POSTリクエストのみを許可
    if (req.method !== 'POST' && req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // リクエストからパラメータを取得
    const theme = req.query.theme || req.body.theme || 'モダン';
    const slideIndex = req.query.slide || req.body.slide || 0;
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    // HTML形式のプレゼンテーションのURLを構築
    const presentationUrl = `${baseUrl}/api/test-export?theme=${theme}&format=html`;
    
    // Puppeteerを使用してPNGを生成
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // ビューポートサイズを設定（16:9のアスペクト比）
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2 // 高解像度
    });
    
    // HTMLページを読み込む
    await page.goto(presentationUrl, { waitUntil: 'networkidle0' });
    
    // 特定のスライドを選択
    const slideSelector = `#slide-${parseInt(slideIndex as string) + 1}`;
    await page.waitForSelector(slideSelector);
    
    // スライド要素のスクリーンショットを撮影
    const element = await page.$(slideSelector);
    if (!element) {
      await browser.close();
      return res.status(404).json({ error: 'Slide not found' });
    }
    
    const pngBuffer = await element.screenshot({
      type: 'png',
      omitBackground: false,
      encoding: 'binary'
    });
    
    await browser.close();
    
    // PNGをレスポンスとして返す
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="slide-${slideIndex}-${theme}.png"`);
    return res.status(200).send(pngBuffer);
    
  } catch (error) {
    console.error('Error generating PNG:', error);
    return res.status(500).json({ error: 'Failed to generate PNG' });
  }
}
