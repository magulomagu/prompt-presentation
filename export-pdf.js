// PDF形式でのエクスポートを行うAPIエンドポイント
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
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    // HTML形式のプレゼンテーションのURLを構築
    const presentationUrl = `${baseUrl}/api/test-export?theme=${theme}&format=html`;
    
    // Puppeteerを使用してPDFを生成
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // HTMLページを読み込む
    await page.goto(presentationUrl, { waitUntil: 'networkidle0' });
    
    // PDFを生成
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    await browser.close();
    
    // PDFをレスポンスとして返す
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="presentation-${theme}.pdf"`);
    return res.status(200).send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
