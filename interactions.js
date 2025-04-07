// ユーザーインタラクション要素の改善
document.addEventListener('DOMContentLoaded', function() {
  // 要素の取得
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const modelTabs = document.querySelectorAll('.model-tab');
  const apiKeyTabs = document.querySelectorAll('.api-key-tab');
  const toggleAdvancedBtn = document.getElementById('toggle-advanced');
  const advancedOptions = document.querySelector('.advanced-options');
  const tagInput = document.getElementById('tag-input');
  const addTagBtn = document.getElementById('add-tag');
  const tagsContainer = document.getElementById('tags-container');
  const tagsHiddenInput = document.getElementById('tags');
  const apiKeyBtn = document.getElementById('api-key-btn');
  const apiKeyModal = document.getElementById('api-key-modal');
  const closeModalBtn = document.querySelector('.close-btn');
  const cancelApiKeyBtn = document.getElementById('cancel-api-key');
  const saveApiKeyBtn = document.getElementById('save-api-key');
  const presentationForm = document.getElementById('presentation-form');
  const generateBtn = document.getElementById('generate-btn');
  const prevSlideBtn = document.getElementById('prev-slide');
  const nextSlideBtn = document.getElementById('next-slide');
  const backBtn = document.getElementById('back-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const retryBtn = document.getElementById('retry-btn');
  const notificationContainer = document.querySelector('.notification-container');
  const slidesContainer = document.querySelector('.slides-container');
  const presentationContainer = document.querySelector('.presentation-container');
  const loadingContainer = document.querySelector('.loading-container');
  const errorPage = document.getElementById('error-page');
  const errorMessage = document.getElementById('error-message');
  const errorDetails = document.getElementById('error-details');
  const slideNumberDisplay = document.querySelector('.slide-number');
  const promptInput = document.getElementById('prompt');
  const promptError = document.getElementById('prompt-error');

  // 現在のスライドインデックス
  let currentSlideIndex = 0;
  let slides = [];
  let currentModel = 'openai';
  let tags = [];

  // ダークモード切り替え
  themeToggleBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    const isDarkMode = document.body.classList.contains('dark-theme');
    themeToggleBtn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('darkMode', isDarkMode);
  });

  // ページ読み込み時にダークモードの設定を復元
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === 'true') {
    document.body.classList.add('dark-theme');
    themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && savedDarkMode === null) {
    document.body.classList.add('dark-theme');
    themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
  }

  // モデルタブ切り替え
  modelTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      modelTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentModel = this.dataset.model;
    });
  });

  // APIキータブ切り替え
  apiKeyTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      apiKeyTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      const provider = this.dataset.provider;
      document.querySelectorAll('.api-key-content').forEach(content => {
        content.style.display = 'none';
      });
      document.getElementById(`${provider}-api-key-content`).style.display = 'block';
    });
  });

  // 詳細オプション切り替え
  toggleAdvancedBtn.addEventListener('click', function() {
    const isVisible = advancedOptions.style.display === 'block';
    advancedOptions.style.display = isVisible ? 'none' : 'block';
    this.innerHTML = isVisible ? 
      '<i class="fas fa-chevron-down"></i> 詳細オプション' : 
      '<i class="fas fa-chevron-up"></i> 詳細オプションを閉じる';
    
    // アニメーション
    if (!isVisible) {
      advancedOptions.classList.add('slide-up');
      setTimeout(() => {
        advancedOptions.classList.remove('slide-up');
      }, 300);
    }
  });

  // タグ追加機能
  function addTag() {
    const tagText = tagInput.value.trim();
    if (tagText) {
      if (!tags.includes(tagText)) {
        tags.push(tagText);
        renderTags();
        tagInput.value = '';
      } else {
        showNotification('このタグは既に追加されています', 'warning');
      }
    }
  }

  addTagBtn.addEventListener('click', addTag);
  tagInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  });

  // タグ表示更新
  function renderTags() {
    tagsContainer.innerHTML = '';
    tags.forEach((tag, index) => {
      const tagElement = document.createElement('div');
      tagElement.className = 'tag';
      tagElement.innerHTML = `
        ${tag}
        <button type="button" class="tag-remove-btn" data-index="${index}">
          <i class="fas fa-times"></i>
        </button>
      `;
      tagsContainer.appendChild(tagElement);
    });
    
    // タグ削除ボタンにイベントリスナーを追加
    document.querySelectorAll('.tag-remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        tags.splice(index, 1);
        renderTags();
      });
    });
    
    // 隠しフィールドに値を設定
    tagsHiddenInput.value = JSON.stringify(tags);
  }

  // APIキーモーダル表示
  apiKeyBtn.addEventListener('click', function() {
    apiKeyModal.style.display = 'flex';
    apiKeyModal.classList.add('fade-in');
    
    // APIキー入力欄に保存された値を設定
    const openaiApiKey = localStorage.getItem('openaiApiKey') || '';
    const geminiApiKey = localStorage.getItem('geminiApiKey') || '';
    
    document.getElementById('openai-api-key').value = openaiApiKey;
    document.getElementById('gemini-api-key').value = geminiApiKey;
    
    // APIキーのステータス表示
    updateApiKeyStatus('openai', openaiApiKey);
    updateApiKeyStatus('gemini', geminiApiKey);
  });

  // APIキーのステータス表示を更新
  function updateApiKeyStatus(provider, key) {
    const statusElement = document.getElementById(`${provider}-api-key-status`);
    
    if (!key) {
      statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> APIキーが設定されていません';
      statusElement.className = 'api-key-status error';
      return;
    }
    
    // 簡易的な形式チェック
    let isValid = false;
    if (provider === 'openai' && key.startsWith('sk-')) {
      isValid = true;
    } else if (provider === 'gemini' && key.startsWith('AIzaSy')) {
      isValid = true;
    }
    
    if (isValid) {
      statusElement.innerHTML = '<i class="fas fa-check-circle"></i> APIキーが設定されています';
      statusElement.className = 'api-key-status success';
    } else {
      statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> 無効なAPIキー形式です';
      statusElement.className = 'api-key-status error';
    }
  }

  // モーダルを閉じる
  function closeModal() {
    apiKeyModal.classList.remove('fade-in');
    apiKeyModal.style.display = 'none';
  }

  closeModalBtn.addEventListener('click', closeModal);
  cancelApiKeyBtn.addEventListener('click', closeModal);
  
  // モーダル外クリックで閉じる
  apiKeyModal.addEventListener('click', function(e) {
    if (e.target === apiKeyModal) {
      closeModal();
    }
  });
  
  // ESCキーでモーダルを閉じる
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && apiKeyModal.style.display === 'flex') {
      closeModal();
    }
  });

  // APIキー保存
  saveApiKeyBtn.addEventListener('click', function() {
    const openaiApiKey = document.getElementById('openai-api-key').value.trim();
    const geminiApiKey = document.getElementById('gemini-api-key').value.trim();
    
    // ローカルストレージに保存
    if (openaiApiKey) {
      localStorage.setItem('openaiApiKey', openaiApiKey);
    }
    
    if (geminiApiKey) {
      localStorage.setItem('geminiApiKey', geminiApiKey);
    }
    
    showNotification('APIキーを保存しました', 'success');
    closeModal();
    
    // APIキーの状態を更新
    checkApiKeyStatus();
  });

  // APIキーの状態をチェック
  function checkApiKeyStatus() {
    const openaiApiKey = localStorage.getItem('openaiApiKey');
    const geminiApiKey = localStorage.getItem('geminiApiKey');
    
    const hasOpenAI = openaiApiKey && openaiApiKey.startsWith('sk-');
    const hasGemini = geminiApiKey && geminiApiKey.startsWith('AIzaSy');
    
    if (!hasOpenAI && !hasGemini) {
      showNotification('APIキーが設定されていません。右下の鍵アイコンから設定してください。', 'warning', 5000);
      apiKeyBtn.classList.add('pulse');
    } else {
      apiKeyBtn.classList.remove('pulse');
    }
  }

  // 初期APIキーチェック
  checkApiKeyStatus();

  // フォーム送信処理
  presentationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // バリデーション
    if (!validateForm()) {
      return;
    }
    
    // APIキーチェック
    const apiKey = currentModel === 'openai' ? 
      localStorage.getItem('openaiApiKey') : 
      localStorage.getItem('geminiApiKey');
    
    if (!apiKey) {
      showNotification(`${currentModel === 'openai' ? 'OpenAI' : 'Gemini'} APIキーが設定されていません`, 'error');
      apiKeyBtn.classList.add('pulse');
      return;
    }
    
    // プレゼンテーション生成開始
    generatePresentation();
  });

  // フォームバリデーション
  function validateForm() {
    let isValid = true;
    
    // プロンプトのバリデーション
    if (!promptInput.value.trim()) {
      promptInput.classList.add('error');
      promptError.style.display = 'block';
      isValid = false;
    } else {
      promptInput.classList.remove('error');
      promptError.style.display = 'none';
    }
    
    return isValid;
  }

  // プロンプト入力時にエラー表示を消す
  promptInput.addEventListener('input', function() {
    if (this.value.trim()) {
      this.classList.remove('error');
      promptError.style.display = 'none';
    }
  });

  // プレゼンテーション生成
  function generatePresentation() {
    // フォームデータの取得
    const prompt = promptInput.value.trim();
    const slideCount = document.getElementById('slide-count').value;
    const theme = document.getElementById('theme').value;
    const presentationStyle = document.getElementById('presentation-style').value;
    const contentDepth = document.getElementById('content-depth').value;
    const languageStyle = document.getElementById('language-style').value;
    const slideStructure = document.getElementById('slide-structure').value;
    
    // ローディング表示
    loadingContainer.style.display = 'flex';
    updateLoadingProgress(0, '準備中...');
    
    // 実際のAPIリクエストを行う代わりにダミーデータを使用
    setTimeout(() => {
      updateLoadingProgress(30, 'プレゼンテーション構造を生成中...');
      
      setTimeout(() => {
        updateLoadingProgress(60, 'スライドコンテンツを作成中...');
        
        setTimeout(() => {
          updateLoadingProgress(90, '最終調整中...');
          
          setTimeout(() => {
            // ダミーデータでプレゼンテーションを生成
            generateDummyPresentation(prompt, slideCount, theme);
            loadingContainer.style.display = 'none';
          }, 1000);
        }, 1500);
      }, 1500);
    }, 1000);
  }

  // ローディング進捗の更新
  function updateLoadingProgress(percent, step) {
    document.querySelector('.loading-progress-bar').style.width = `${percent}%`;
    document.querySelector('.loading-step').textContent = step;
  }

  // ダミープレゼンテーション生成
  function generateDummyPresentation(prompt, slideCount, theme) {
    // タイトルを抽出
    const title = extractTitleFromPrompt(prompt);
    
    // スライド数
    const count = parseInt(slideCount);
    
    // メインポイントを生成
    const mainPoints = generateMainPoints(prompt, count - 2);
    
    // スライドを生成
    slides = [];
    
    // タイトルスライド
    slides.push({
      type: 'title',
      title: title,
      subtitle: '自動生成プレゼンテーション',
      date: new Date().toLocaleDateString()
    });
    
    // 目次スライド
    slides.push({
      type: 'toc',
      title: '目次',
      items: mainPoints.map(point => point.title)
    });
    
    // コンテンツスライド
    mainPoints.forEach(point => {
      slides.push({
        type: 'content',
        title: point.title,
        content: point.content
      });
    });
    
    // 最終スライド
    slides.push({
      type: 'end',
      title: 'ご清聴ありがとうございました',
      subtitle: title
    });
    
    // スライドを表示
    renderSlides(theme);
    
    // プレゼンテーションコンテナを表示
    presentationForm.style.display = 'none';
    presentationContainer.style.display = 'block';
    presentationContainer.classList.add('fade-in');
    
    // 最初のスライドを表示
    currentSlideIndex = 0;
    updateSlideNavigation();
  }

  // プロンプトからタイトルを抽出
  function extractTitleFromPrompt(prompt) {
    // 簡易的なタイトル抽出
    const words = prompt.split(' ');
    if (words.length <= 5) {
      return prompt;
    }
    
    // 「について」などの特定のキーワードで分割
    const keywordMatches = prompt.match(/(.*)(について|に関する|の|に|を)/);
    if (keywordMatches && keywordMatches[1]) {
      return keywordMatches[1];
    }
    
    // 最初の10単語を使用
    return words.slice(0, 10).join(' ');
  }

  // メインポイントを生成
  function generateMainPoints(prompt, count) {
    const points = [];
    
    // ダミーデータ
    const dummyPoints = [
      {
        title: '背景と概要',
        content: '本トピックの背景と概要について説明します。重要なコンテキストと基本的な情報を提供し、聴衆の理解を深めます。'
      },
      {
        title: '主要な課題',
        content: '現在直面している主要な課題について分析します。これらの課題がどのように影響を与えているか、またなぜ重要なのかを説明します。'
      },
      {
        title: '解決策と提案',
        content: '課題に対する具体的な解決策と提案を提示します。これらの解決策がどのように実装できるか、またどのような効果が期待できるかを詳細に説明します。'
      },
      {
        title: 'ケーススタディ',
        content: '実際の成功事例や失敗事例を通じて、提案の有効性を検証します。具体的な数値やデータを用いて説明することで、説得力を高めます。'
      },
      {
        title: '将来の展望',
        content: '今後の展望と長期的なビジョンについて説明します。トレンドや予測を踏まえ、将来的にどのような発展が期待できるかを示します。'
      },
      {
        title: '実装計画',
        content: '具体的な実装計画とタイムラインを提示します。各フェーズでの目標と必要なリソースを明確にし、実行可能な計画を示します。'
      },
      {
        title: 'リスクと対策',
        content: '想定されるリスクと対策について説明します。リスクを事前に特定し、適切な対応策を準備することの重要性を強調します。'
      },
      {
        title: 'コスト分析',
        content: '実装に必要なコストと投資対効果（ROI）の分析を提示します。短期的・長期的な財務影響を考慮し、投資の妥当性を示します。'
      },
      {
        title: 'チーム体制',
        content: '実装に必要なチーム体制と役割分担について説明します。各メンバーの責任範囲と連携方法を明確にし、効率的な実行体制を示します。'
      },
      {
        title: '成功指標',
        content: '成功を測定するための具体的な指標（KPI）を設定します。定量的・定性的な評価方法を組み合わせ、総合的な成功評価の枠組みを提示します。'
      },
      {
        title: 'フィードバックループ',
        content: '継続的な改善のためのフィードバックループの構築方法を説明します。定期的な評価と調整のプロセスを組み込むことの重要性を強調します。'
      },
      {
        title: 'まとめと次のステップ',
        content: '主要なポイントをまとめ、次のステップについて明確な指針を提示します。具体的なアクションアイテムと担当者を特定し、即座に行動に移せるようにします。'
      }
    ];
    
    // 必要な数のポイントを選択
    for (let i = 0; i < count; i++) {
      if (i < dummyPoints.length) {
        points.push(dummyPoints[i]);
      }
    }
    
    return points;
  }

  // スライドをレンダリング
  function renderSlides(theme) {
    slidesContainer.innerHTML = '';
    
    slides.forEach((slide, index) => {
      const slideElement = document.createElement('div');
      slideElement.className = `slide ${theme}`;
      slideElement.style.display = index === currentSlideIndex ? 'flex' : 'none';
      
      let content = '';
      
      switch (slide.type) {
        case 'title':
          content = `
            <div class="slide-content">
              <h2 class="slide-title">${slide.title}</h2>
              <p class="slide-subtitle">${slide.subtitle}</p>
            </div>
            <div class="slide-footer">
              ${slide.date}
            </div>
          `;
          break;
          
        case 'toc':
          content = `
            <h2 class="slide-title">${slide.title}</h2>
            <div class="slide-content">
              <ul>
                ${slide.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          `;
          break;
          
        case 'content':
          content = `
            <h2 class="slide-title">${slide.title}</h2>
            <div
(Content truncated due to size limit. Use line ranges to read in chunks)