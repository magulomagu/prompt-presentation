// エラーハンドリングとログ機能
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// ログディレクトリの作成
const LOG_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ロガーの設定
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'presentation-generator' },
  transports: [
    // エラーログはファイルに出力
    new winston.transports.File({ 
      filename: path.join(LOG_DIR, 'error.log'), 
      level: 'error' 
    }),
    // すべてのログはファイルに出力
    new winston.transports.File({ 
      filename: path.join(LOG_DIR, 'combined.log') 
    }),
    // 開発環境ではコンソールにも出力
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// APIリクエストのログミドルウェア
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // レスポンス送信時の処理
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent') || '-',
      ip: req.ip || req.connection.remoteAddress
    };
    
    // ステータスコードに応じてログレベルを変更
    if (res.statusCode >= 500) {
      logger.error('Server Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Client Error', logData);
    } else {
      logger.info('Request', logData);
    }
  });
  
  next();
};

// エラーハンドリングミドルウェア
const errorHandler = (err, req, res, next) => {
  // エラーログ
  logger.error('Unhandled Error', {
    error: {
      message: err.message,
      stack: err.stack
    },
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    ip: req.ip || req.connection.remoteAddress
  });
  
  // クライアントへのレスポンス
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'サーバーエラーが発生しました' 
      : err.message,
    error: process.env.NODE_ENV === 'production' 
      ? undefined 
      : err.stack
  });
};

// レート制限ミドルウェア
const rateLimit = (options = {}) => {
  const {
    windowMs = 60 * 1000, // デフォルト: 1分
    max = 10, // デフォルト: 10リクエスト/分
    message = 'リクエスト数が多すぎます。しばらく待ってから再試行してください。'
  } = options;
  
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // 古いリクエストの削除
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter(time => now - time < windowMs);
      requests.set(ip, userRequests);
      
      if (userRequests.length >= max) {
        logger.warn('Rate Limit Exceeded', {
          ip,
          requests: userRequests.length,
          limit: max,
          window: `${windowMs / 1000}s`
        });
        
        return res.status(429).json({
          success: false,
          message: message
        });
      }
      
      userRequests.push(now);
    } else {
      requests.set(ip, [now]);
    }
    
    next();
  };
};

// APIキーエラーハンドラー
const handleApiKeyError = (error) => {
  if (error.message.includes('API key')) {
    return {
      status: 401,
      message: 'APIキーが無効または設定されていません'
    };
  }
  
  if (error.message.includes('rate limit')) {
    return {
      status: 429,
      message: 'APIレート制限に達しました。しばらく待ってから再試行してください。'
    };
  }
  
  return {
    status: 500,
    message: 'APIリクエスト中にエラーが発生しました'
  };
};

module.exports = {
  logger,
  requestLogger,
  errorHandler,
  rateLimit,
  handleApiKeyError
};
