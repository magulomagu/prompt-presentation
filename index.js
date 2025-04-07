// Next.jsのページコンポーネント
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import ApiClient from '../public/js/api-client';

export default function Home() {
  const [activeModel, setActiveModel] = useState('openai');
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [theme, setTheme] = useState('モダン');
  const [isGenerating, setIsGenerating] = useState(false);
  const [presentation, setPresentation] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    gemini: ''
  });
  const [notification, setNotification] = useState(null);

  // ローカルストレージからAPIキーを読み込む
  useEffect(() => {
    const storedOpenAIKey = localStorage.getItem('openai_api_key');
    const storedGeminiKey = localStorage.getItem('gemini_api_key');
    
    if (storedOpenAIKey || storedGeminiKey) {
      setApiKeys({
        openai: storedOpenAIKey || '',
        gemini: storedGeminiKey || ''
      });
    }
  }, []);

  // 通知を表示する関数
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // APIキーを保存する関数
  const saveApiKey = async (model) => {
    const apiKey = apiKeys[model];
    
    if (!apiKey) {
      showNotification(`${model === 'openai' ? 'OpenAI' : 'Gemini'} APIキーが入力されていません`, 'error');
      return;
    }

    try {
      // APIキーの検証
      const result = await ApiClient.validateApiKey(apiKey, model);
      
      if (result.valid) {
        // ローカルストレージに保存
        localStorage.setItem(`${model}_api_key`, apiKey);
        showNotification(`${model === 'openai' ? 'OpenAI' : 'Gemini'} APIキーが正常に保存されました`, 'success');
      } else {
        showNotification(`無効な${model === 'openai' ? 'OpenAI' : 'Gemini'} APIキーです`, 'error');
      }
    } catch (error) {
      showNotification(`APIキーの検証中にエラーが発生しました: ${error.message}`, 'error');
    }
  };

  // プレゼンテーションを生成する関数
  const generatePresentation = async () => {
    if (!prompt) {
      showNotification('プロンプトを入力してください', 'warning');
      return;
    }

    const currentApiKey = apiKeys[activeModel];
    if (!currentApiKey) {
      showNotification(`${activeModel === 'openai' ? 'OpenAI' : 'Gemini'} APIキーが設定されていません`, 'warning');
      setShowApiKeyModal(true);
      return;
    }

    setIsGenerating(true);
    
    try {
      let result;
      const options = {
        slideCount,
        theme,
        // その他のオプション
      };

      if (activeModel === 'openai') {
        result = await ApiClient.generateWithOpenAI(prompt, options);
      } else {
        result = await ApiClient.generateWithGemini(prompt, options);
      }

      setPresentation(result);
      setCurrentSlide(0);
      showNotification('プレゼンテーションが生成されました', 'success');
    } catch (error) {
      showNotification(`プレゼンテーション生成中にエラーが発生しました: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // 次のスライドに移動
  const nextSlide = () => {
    if (presentation && currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  // 前のスライドに移動
  const prevSlide = () => {
    if (presentation && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

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
        <button className="theme-toggle" aria-label="テーマ切替">
          <i className="fas fa-moon"></i>
        </button>
      </header>

      {notification && (
        <div className={`notification ${notification.type} show`}>
          <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : notification.type === 'error' ? 'exclamation-circle' : notification.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}`}></i>
          <span>{notification.message}</span>
          <button className="notification-close" onClick={() => setNotification(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {!presentation ? (
        <main className="input-container">
          <div className="card">
            <h2>プレゼンテーション設定</h2>
            
            <div className="model-tabs">
              <button 
                className={`model-tab ${activeModel === 'openai' ? 'active' : ''}`}
                onClick={() => setActiveModel('openai')}
              >
                <i className="fas fa-robot"></i> OpenAI
              </button>
              <button 
                className={`model-tab ${activeModel === 'gemini' ? 'active' : ''}`}
                onClick={() => setActiveModel('gemini')}
              >
                <i className="fas fa-magic"></i> Gemini
              </button>
            </div>
            
            <div className="form-group">
              <label htmlFor="prompt">プロンプト <span className="required">*</span></label>
              <textarea 
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例: AIの歴史と未来について10枚のスライドを作成"
                required
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="slideCount">スライド枚数</label>
                <select 
                  id="slideCount"
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                >
                  <option value="5">5枚</option>
                  <option value="10">10枚</option>
                  <option value="15">15枚</option>
                  <option value="20">20枚</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="theme">デザインテーマ</label>
                <select 
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="モダン">モダン</option>
                  <option value="コーポレート">コーポレート</option>
                  <option value="クリエイティブ">クリエイティブ</option>
                  <option value="ミニマル">ミニマル</option>
                </select>
              </div>
            </div>
            
            <button 
              className="btn-toggle"
              onClick={() => setShowOptions(!showOptions)}
            >
              <i className={`fas fa-chevron-${showOptions ? 'up' : 'down'}`}></i> 詳細オプション
            </button>
            
            {showOptions && (
              <div className="advanced-options">
                {/* 詳細オプションの内容 */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="style">プレゼンテーションスタイル</label>
                    <select id="style">
                      <option value="professional">プロフェッショナル</option>
                      <option value="academic">アカデミック</option>
                      <option value="creative">クリエイティブ</option>
                      <option value="casual">カジュアル</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="detailLevel">内容の詳細度</label>
                    <select id="detailLevel">
                      <option value="concise">簡潔</option>
                      <option value="balanced">バランス</option>
                      <option value="detailed">詳細</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="languageStyle">言語スタイル</label>
                    <select id="languageStyle">
                      <option value="formal">フォーマル</option>
                      <option value="standard">標準</option>
                      <option value="casual">カジュアル</option>
                      <option value="technical">技術的</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="slideStructure">スライド構成</label>
                    <select id="slideStructure">
                      <option value="auto">自動</option>
                      <option value="text-heavy">テキスト重視</option>
                      <option value="visual">ビジュアル重視</option>
                      <option value="balanced">バランス型</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="tags">キーワード/タグ</label>
                  <div className="tags-input">
                    <input type="text" id="tags" placeholder="タグを入力して Enter" />
                    <div className="tags-container">
                      {/* タグが表示される場所 */}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              className="btn-primary"
              onClick={generatePresentation}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> 生成中...
                </>
              ) : (
                <>
                  <i className="fas fa-file-powerpoint"></i> 資料を生成
                </>
              )}
            </button>
          </div>
        </main>
      ) : (
        <main className="presentation-container">
          <div className="slide-container">
            <div className="slide">
              {presentation.slides[currentSlide].type === 'title' ? (
                <div className="title-slide">
                  <h1>{presentation.slides[currentSlide].title}</h1>
                  <h2>{presentation.slides[currentSlide].content}</h2>
                </div>
              ) : presentation.slides[currentSlide].type === 'bullets' ? (
                <div className="bullets-slide">
                  <h2>{presentation.slides[currentSlide].title}</h2>
                  <ul>
                    {presentation.slides[currentSlide].content.split('\n').map((item, index) => (
                      <li key={index}>{item.replace(/^[-•*]\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="content-slide">
                  <h2>{presentation.slides[currentSlide].title}</h2>
                  <div className="slide-content">
                    {presentation.slides[currentSlide].content}
                  </div>
                </div>
              )}
            </div>
            
            <div className="slide-controls">
              <button onClick={prevSlide} disabled={currentSlide === 0}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <span>{currentSlide + 1} / {presentation.slides.length}</span>
              <button onClick={nextSlide} disabled={currentSlide === presentation.slides.length - 1}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
          
          <div className="presentation-actions">
            <button className="btn-secondary" onClick={() => setPresentation(null)}>
              <i className="fas fa-arrow-left"></i> 戻る
            </button>
            <button className="btn-primary">
              <i className="fas fa-download"></i> ダウンロード
            </button>
          </div>
        </main>
      )}

      <footer>
        <div className="footer-links">
          <a href="#" className="footer-link">使い方</a>
          <a href="#" className="footer-link">プライバシーポリシー</a>
        </div>
        <p>© 2025 プロンプトからPPT風資料生成</p>
      </footer>

      {showApiKeyModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>APIキー設定</h3>
              <button className="modal-close" onClick={() => setShowApiKeyModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="api-key-tabs">
                <button 
                  className={`api-key-tab ${activeModel === 'openai' ? 'active' : ''}`}
                  onClick={() => setActiveModel('openai')}
                >
                  <i className="fas fa-robot"></i> OpenAI
                </button>
                <button 
                  className={`api-key-tab ${activeModel === 'gemini' ? 'active' : ''}`}
                  onClick={() => setActiveModel('gemini')}
                >
                  <i className="fas fa-magic"></i> Gemini
                </button>
              </div>
              
              {activeModel === 'openai' ? (
                <div className="api-key-form">
                  <p>OpenAI APIキーを入力して、GPT-4によるプレゼンテーション生成機能を有効にします。</p>
                  <div className="form-group">
                    <label htmlFor="openai-api-key">APIキー:</label>
                    <input 
                      type="password" 
                      id="openai-api-key" 
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})}
                      placeholder="sk-..."
                    />
                  </div>
                </div>
              ) : (
                <div className="api-key-form">
                  <p>Gemini APIキーを入力して、Gemini 1.5 Proによるプレゼンテーション生成機能を有効にします。</p>
                  <div className="form-group">
                    <label htmlFor="gemini-api-key">APIキー:</label>
                    <input 
                      type="password" 
                      id="gemini-api-key" 
                      value={apiKeys.gemini}
                      onChange={(e) => setApiKeys({...apiKeys, gemini: e.target.value})}
                      placeholder="AIzaSy..."
                    />
                  </div>
                </div>
              )}
              
              <p className="api-key-note">
                注意: APIキーはブラウザのローカルストレージに保存され、サーバーには送信されません。APIキーを使用すると、各サービスの利用料金が発生する場合があります。
              </p>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowApiKeyModal(false)}>キャンセル</button>
              <button className="btn-primary" onClick={() => saveApiKey(activeModel)}>保存</button>
            </div>
          </div>
        </div>
      )}

      <button className="floating-btn api-key-btn" onClick={() => setShowApiKeyModal(true)} aria-label="APIキー設定">
        <i className="fas fa-key"></i>
      </button>
    </div>
  );
}
