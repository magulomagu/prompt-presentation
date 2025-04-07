// Next.jsのスタイルシート
import '../styles.css';
import '../responsive.css';
import '../notifications.css';
import '../monochrome.css';
import '../monochrome-decorations.css';
import '../optimizations.css';

// カスタムAppコンポーネント
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
