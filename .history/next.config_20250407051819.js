// Next.js設定ファイル
module.exports = {
  // 出力ディレクトリ
  distDir: 'build',
  
  // 静的ファイルの配置
  publicRuntimeConfig: {
    staticFolder: '/static',
  },
  
  // 環境変数
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  
  // APIルートの設定
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      }
    ];
  },
  
  // 静的ファイルの最適化
  optimizeFonts: true,
  optimizeImages: true,
  
  // サーバーサイドレンダリングの設定
  reactStrictMode: true,
};
