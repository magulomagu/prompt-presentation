// Next.jsのスタイルシート
import '../public/css/styles.css';
import '../public/css/responsive.css';
import '../public/css/notifications.css';

// カスタムAppコンポーネント
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
