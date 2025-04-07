// Next.jsのページコンポーネント
import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>プロンプトからPPT風資料生成</title>
        <meta name="description" content="プロンプトからPPT風資料を生成するWebアプリ" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </Head>

      <header>
        <h1>プロンプトからPPT風資料生成</h1>
      </header>

      <main className="input-container">
        <div className="card">
          <h2>プレゼンテーション設定</h2>
          <p>Next.jsでのDeployに対応したバージョンです。</p>
        </div>
      </main>

      <footer>
        <p>&copy; 2024 プロンプトプレゼンテーション</p>
      </footer>
    </div>
  );
} 