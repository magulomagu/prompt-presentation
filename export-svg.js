// SVG形式でのエクスポートを行うAPIエンドポイント
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
    
    // Puppeteerを使用してSVGを生成
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // HTMLページを読み込む
    await page.goto(presentationUrl, { waitUntil: 'networkidle0' });
    
    // 特定のスライドを選択
    const slideSelector = `#slide-${parseInt(slideIndex as string) + 1}`;
    await page.waitForSelector(slideSelector);
    
    // スライドのSVGを取得
    const svgData = await page.evaluate((selector) => {
      const slideElement = document.querySelector(selector);
      if (!slideElement) return null;
      
      // SVG要素を作成
      const xmlns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(xmlns, "svg");
      
      // スライドの寸法を取得
      const rect = slideElement.getBoundingClientRect();
      svg.setAttribute("width", rect.width.toString());
      svg.setAttribute("height", rect.height.toString());
      svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
      
      // スライドの内容をSVGに変換
      const foreignObject = document.createElementNS(xmlns, "foreignObject");
      foreignObject.setAttribute("width", "100%");
      foreignObject.setAttribute("height", "100%");
      
      // スライドのHTMLをクローン
      const slideClone = slideElement.cloneNode(true);
      foreignObject.appendChild(slideClone);
      svg.appendChild(foreignObject);
      
      // SVG文字列を返す
      return new XMLSerializer().serializeToString(svg);
    }, slideSelector);
    
    await browser.close();
    
    if (!svgData) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    
    // SVGをレスポンスとして返す
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="slide-${slideIndex}-${theme}.svg"`);
    return res.status(200).send(svgData);
    
  } catch (error) {
    console.error('Error generating SVG:', error);
    return res.status(500).json({ error: 'Failed to generate SVG' });
  }
}
