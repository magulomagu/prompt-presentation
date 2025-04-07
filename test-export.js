// APIテスト用のエンドポイント - ダミーデータでプレゼンテーションを生成し、異なる形式でエクスポート
import { NextApiRequest, NextApiResponse } from 'next';

// ダミープレゼンテーションデータ
const generateDummyPresentation = (theme) => {
  return {
    title: "AIの進化と未来展望",
    subtitle: "テクノロジーが変える私たちの生活",
    author: "テスト ユーザー",
    theme: theme || "モダン",
    slides: [
      {
        type: "title",
        title: "AIの進化と未来展望",
        content: "テクノロジーが変える私たちの生活",
        notes: "このプレゼンテーションでは、AIの進化と未来の可能性について説明します。"
      },
      {
        type: "content",
        title: "AIとは何か",
        content: "人工知能（AI）は、人間の知能を模倣し、学習、問題解決、パターン認識などのタスクを実行するコンピュータシステムです。機械学習、深層学習、自然言語処理などの技術を含みます。",
        notes: "AIの基本的な定義と主要な技術分野について説明します。"
      },
      {
        type: "bullets",
        title: "AIの主要な分野",
        content: "- 機械学習（ML）：データからパターンを学習\n- 深層学習：ニューラルネットワークを使用\n- 自然言語処理（NLP）：人間の言語を理解・生成\n- コンピュータビジョン：画像や動画を解析\n- ロボティクス：物理的な動作を制御",
        notes: "AIの主要な技術分野について説明します。各分野の詳細は後のスライドで説明します。"
      },
      {
        type: "image",
        title: "AIの発展の歴史",
        content: "1950年代：AIという概念の誕生\n1980年代：エキスパートシステムの台頭\n2010年代：深層学習の革命\n2020年代：生成AIの爆発的成長",
        imageUrl: "https://via.placeholder.com/800x600?text=AI+History+Timeline",
        notes: "AIの歴史的な発展について、主要なマイルストーンを紹介します。"
      },
      {
        type: "twoColumn",
        title: "AIの現在の応用例",
        leftContent: "ビジネス分野：\n- 顧客サービス（チャットボット）\n- 需要予測と在庫管理\n- 不正検出と防止\n- マーケティングの最適化",
        rightContent: "日常生活：\n- バーチャルアシスタント\n- レコメンデーションシステム\n- スマートホームデバイス\n- 翻訳サービス",
        notes: "AIがビジネスと日常生活でどのように応用されているかを対比して説明します。"
      },
      {
        type: "quote",
        title: "AIの可能性",
        content: "「AIは電気のように社会のあらゆる側面に浸透し、私たちの生活様式を根本的に変えるでしょう。」",
        author: "アンドリュー・ン",
        notes: "AIの将来的な影響力について、著名な専門家の見解を引用します。"
      },
      {
        type: "bullets",
        title: "AIの未来の展望",
        content: "- 一般人工知能（AGI）の開発\n- 医療診断と治療の革新\n- 自動運転技術の普及\n- 気候変動対策への貢献\n- 教育の個別最適化",
        notes: "AIの将来的な発展方向と社会への影響について説明します。"
      },
      {
        type: "content",
        title: "AIの倫理的課題",
        content: "AIの急速な発展に伴い、プライバシー、バイアス、雇用への影響、意思決定の透明性、安全性など、多くの倫理的課題が浮上しています。これらの課題に対処するためには、技術開発と並行して、適切な規制枠組みと倫理ガイドラインの策定が不可欠です。",
        notes: "AIの発展に伴う倫理的課題とその対応策について説明します。"
      },
      {
        type: "bullets",
        title: "AIとの共存のために",
        content: "- AIリテラシーの向上\n- 人間中心の設計原則の採用\n- 継続的な教育とスキルの更新\n- 包括的な規制枠組みの構築\n- 国際協力の促進",
        notes: "AIと人間が調和して共存するために必要な取り組みについて説明します。"
      },
      {
        type: "final",
        title: "まとめ：AIと共に創る未来",
        content: "AIは単なる技術革新を超え、社会変革の触媒となっています。その潜在能力を最大限に活かしながら、リスクを最小化するためには、技術者、政策立案者、市民社会の協力が不可欠です。私たち全員がAIの発展と応用に関する対話に参加することで、より公平で持続可能な未来を共に創ることができるでしょう。",
        notes: "プレゼンテーションの主要ポイントをまとめ、AIの未来に関する前向きなメッセージで締めくくります。"
      }
    ]
  };
};

// HTML形式のプレゼンテーションを生成
const generateHtmlPresentation = (presentation) => {
  let html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentation.title}</title>
  <style>
    :root {
      --primary-color: #4a6cf7;
      --secondary-color: #6c757d;
      --background-color: #ffffff;
      --text-color: #333333;
      --font-family: 'Helvetica Neue', Arial, sans-serif;
    }
    
    body {
      font-family: var(--font-family);
      margin: 0;
      padding: 0;
      background-color: var(--background-color);
      color: var(--text-color);
    }
    
    .presentation {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .slide {
      border: 1px solid #ddd;
      margin-bottom: 30px;
      padding: 40px;
      background-color: white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      page-break-after: always;
    }
    
    .slide-number {
      text-align: right;
      font-size: 14px;
      color: #999;
      margin-top: 20px;
    }
    
    h1 {
      color: var(--primary-color);
      font-size: 36px;
      margin-bottom: 20px;
    }
    
    h2 {
      color: var(--primary-color);
      font-size: 28px;
      margin-bottom: 15px;
    }
    
    p {
      font-size: 18px;
      line-height: 1.6;
    }
    
    ul {
      font-size: 18px;
      line-height: 1.6;
    }
    
    .title-slide {
      text-align: center;
    }
    
    .title-slide h1 {
      font-size: 48px;
    }
    
    .title-slide h2 {
      font-size: 32px;
      color: var(--secondary-color);
    }
    
    .two-column {
      display: flex;
      gap: 40px;
    }
    
    .column {
      flex: 1;
    }
    
    .quote {
      font-style: italic;
      font-size: 24px;
      padding: 20px;
      border-left: 5px solid var(--primary-color);
      margin: 20px 0;
    }
    
    .quote-author {
      text-align: right;
      font-size: 18px;
      margin-top: 10px;
    }
    
    .final-slide {
      text-align: center;
    }
    
    .notes {
      margin-top: 30px;
      padding: 15px;
      background-color: #f8f9fa;
      border-left: 3px solid var(--primary-color);
      font-size: 14px;
      color: #666;
    }
    
    .theme-monochrome {
      --primary-color: #000000;
      --secondary-color: #666666;
      --background-color: #ffffff;
      --text-color: #000000;
    }
    
    .theme-monochrome .slide {
      border: 2px solid #000;
    }
    
    .theme-monochrome h1,
    .theme-monochrome h2 {
      color: #000;
    }
    
    .theme-monochrome .quote {
      border-left: 5px solid #000;
    }
    
    @media print {
      .slide {
        page-break-after: always;
        border: none;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="presentation ${presentation.theme === 'モノクローム' ? 'theme-monochrome' : ''}">
`;

  // スライドを生成
  presentation.slides.forEach((slide, index) => {
    html += `<div class="slide" id="slide-${index + 1}">`;
    
    if (slide.type === "title") {
      html += `
        <div class="title-slide">
          <h1>${slide.title}</h1>
          <h2>${slide.content}</h2>
        </div>
      `;
    } else if (slide.type === "bullets") {
      html += `
        <h1>${slide.title}</h1>
        <ul>
          ${slide.content.split('\n').map(item => `<li>${item.replace(/^[-•*]\s*/, '')}</li>`).join('')}
        </ul>
      `;
    } else if (slide.type === "twoColumn") {
      html += `
        <h1>${slide.title}</h1>
        <div class="two-column">
          <div class="column">
            ${slide.leftContent.split('\n').map(line => `<p>${line}</p>`).join('')}
          </div>
          <div class="column">
            ${slide.rightContent.split('\n').map(line => `<p>${line}</p>`).join('')}
          </div>
        </div>
      `;
    } else if (slide.type === "quote") {
      html += `
        <h1>${slide.title}</h1>
        <div class="quote">
          ${slide.content}
          <div class="quote-author">- ${slide.author}</div>
        </div>
      `;
    } else if (slide.type === "image") {
      html += `
        <h1>${slide.title}</h1>
        <img src="${slide.imageUrl}" alt="${slide.title}" style="max-width: 100%; height: auto;">
        <p>${slide.content}</p>
      `;
    } else if (slide.type === "final") {
      html += `
        <div class="final-slide">
          <h1>${slide.title}</h1>
          <p>${slide.content}</p>
        </div>
      `;
    } else {
      // デフォルトは通常のコンテンツスライド
      html += `
        <h1>${slide.title}</h1>
        <p>${slide.content}</p>
      `;
    }
    
    // 発表者ノート（オプション）
    if (slide.notes) {
      html += `<div class="notes"><strong>発表者ノート:</strong> ${slide.notes}</div>`;
    }
    
    // スライド番号
    html += `<div class="slide-number">${index + 1} / ${presentation.slides.length}</div>`;
    html += `</div>`;
  });
  
  html += `
  </div>
</body>
</html>
  `;
  
  return html;
};

// APIハンドラー
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // POSTリクエストのみを許可
    if (req.method !== 'POST' && req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // リクエストからパラメータを取得
    const format = req.query.format || req.body.format || 'html';
    const theme = req.query.theme || req.body.theme || 'モダン';
    
    // ダミープレゼンテーションを生成
    const presentation = generateDummyPresentation(theme);
    
    // 要求された形式に基づいてレスポンスを返す
    switch (format) {
      case 'json':
        // JSON形式でプレゼンテーションデータを返す
        return res.status(200).json(presentation);
        
      case 'html':
      default:
        // HTML形式でプレゼンテーションを返す
        const html = generateHtmlPresentation(presentation);
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
    }
  } catch (error) {
    console.error('Error in test-export API:', error);
    return res.status(500).json({ error: 'Failed to generate test export' });
  }
}
