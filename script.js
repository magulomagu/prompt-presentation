// グローバル変数
let currentSlide = 0;
let totalSlides = 0;
let slides = [];
let isFullscreen = false;
let isGenerating = false;
let retryCount = 0;
const MAX_RETRIES = 3;
let tags = [];
let loadingProgress = 0;
let loadingInterval;
let openaiApiKey = null;
let geminiApiKey = null;
let selectedModelProvider = 'openai'; // デフォルトはOpenAI
let isStaticMode = true; // 静的デプロイモード（サーバーサイド機能なし）

// DOM要素
const generateBtn = document.getElementById('generate-btn');
const promptInput = document.getElementById('prompt-input');
const slideCountSelect = document.getElementById('slide-count');
const themeSelect = document.getElementById('theme-select');
const presentationContainer = document.getElementById('presentation-container');
const slidesContainer = document.getElementById('slides-container');
const loadingContainer = document.getElementById('loading-container');
const loadingMessage = document.querySelector('.loading-container p');
const loadingProgressBar = document.getElementById('loading-progress-bar');
const prevSlideBtn = document.getElementById('prev-slide');
const nextSlideBtn = document.getElementById('next-slide');
const slideCounter = document.getElementById('slide-counter');
const progressBar = document.getElementById('progress-bar');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const editBtn = document.getElementById('edit-btn');
const backBtn = document.getElementById('back-btn');

// 詳細オプション要素
const advancedOptionsToggle = document.querySelector('.advanced-options-toggle');
const advancedOptionsContent = document.querySelector('.advanced-options-content');
const presentationStyleSelect = document.getElementById('presentation-style');
const contentDepthSelect = document.getElementById('content-depth');
const languageStyleSelect = document.getElementById('language-style');
const slideStructureSelect = document.getElementById('slide-structure');
const tagsContainer = document.getElementById('tags-container');
const tagInput = document.getElementById('tag-input');
const addTagBtn = document.getElementById('add-tag-btn');

// フィードバック要素
const feedbackToggle = document.getElementById('feedback-toggle');
const feedbackForm = document.getElementById('feedback-form');
const feedbackText = document.getElementById('feedback-text');
const feedbackSubmit = document.getElementById('feedback-submit');
const feedbackCancel = document.getElementById('feedback-cancel');

// APIキー要素
const apiKeyToggle = document.getElementById('api-key-toggle');
const apiKeyModal = document.getElementById('api-key-modal');
const openaiApiKeyInput = document.getElementById('openai-api-key-input');
const geminiApiKeyInput = document.getElementById('gemini-api-key-input');
const apiKeySaveBtn = document.getElementById('api-key-save-btn');
const apiKeyCancelBtn = document.getElementById('api-key-cancel-btn');
const openaiApiKeyStatus = document.getElementById('openai-api-key-status');
const geminiApiKeyStatus = document.getElementById('gemini-api-key-status');

// モデル選択要素
const modelTabs = document.querySelectorAll('.model-tab');
const openaiSection = document.getElementById('openai-section');
const geminiSection = document.getElementById('gemini-section');
const modelOptions = document.querySelectorAll('.model-option');

// APIエンドポイント
const API_ENDPOINT = '/api/generate-presentation';
const API_VALIDATE_KEY_ENDPOINT = '/api/validate-key';

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', () => {
    // 静的デプロイモードの検出
    detectStaticMode();
    
    // テーマ変更イベント
    themeSelect.addEventListener('change', changeTheme);
    
    // 資料生成ボタンイベント
    generateBtn.addEventListener('click', generatePresentation);
    
    // スライドナビゲーションイベント
    prevSlideBtn.addEventListener('click', prevSlide);
    nextSlideBtn.addEventListener('click', nextSlide);
    
    // キーボードナビゲーションイベント
    document.addEventListener('keydown', handleKeyNavigation);
    
    // フルスクリーンボタンイベント
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // 編集ボタンイベント
    editBtn.addEventListener('click', editPresentation);
    
    // 戻るボタンイベント
    backBtn.addEventListener('click', backToInput);
    
    // 詳細オプショントグルイベント
    advancedOptionsToggle.addEventListener('click', toggleAdvancedOptions);
    
    // タグ追加イベント
    addTagBtn.addEventListener('click', addTag);
    tagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    });
    
    // フィードバックイベント
    feedbackToggle.addEventListener('click', toggleFeedbackForm);
    feedbackSubmit.addEventListener('click', submitFeedback);
    feedbackCancel.addEventListener('click', toggleFeedbackForm);
    
    // APIキーイベント
    apiKeyToggle.addEventListener('click', toggleApiKeyModal);
    apiKeySaveBtn.addEventListener('click', saveApiKey);
    apiKeyCancelBtn.addEventListener('click', toggleApiKeyModal);
    
    // モデル選択タブイベント
    modelTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const model = tab.getAttribute('data-model');
            switchModelTab(model);
        });
    });
    
    // モデル選択オプションイベント（メイン画面）
    modelOptions.forEach(option => {
        option.addEventListener('click', () => {
            const model = option.getAttribute('data-model');
            switchModelOption(model);
        });
    });
    
    // オフライン検出
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
    
    // 初期テーマの設定
    changeTheme();
    
    // 保存されたAPIキーの読み込み
    loadApiKeys();
});

// 静的デプロイモードの検出
function detectStaticMode() {
    // サーバーへのpingを試みる
    fetch('/api/ping')
        .then(response => {
            if (response.ok) {
                isStaticMode = false;
                console.log('サーバーモードで動作しています');
            } else {
                isStaticMode = true;
                console.log('静的モードで動作しています');
            }
        })
        .catch(() => {
            isStaticMode = true;
            console.log('静的モードで動作しています（サーバー接続エラー）');
        });
}

// モデル選択タブの切り替え（APIキーモーダル内）
function switchModelTab(model) {
    // タブの切り替え
    modelTabs.forEach(tab => {
        if (tab.getAttribute('data-model') === model) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // セクションの切り替え
    if (model === 'openai') {
        openaiSection.style.display = 'block';
        geminiSection.style.display = 'none';
    } else if (model === 'gemini') {
        openaiSection.style.display = 'none';
        geminiSection.style.display = 'block';
    }
}

// モデル選択オプションの切り替え（メイン画面）
function switchModelOption(model) {
    // オプションの切り替え
    modelOptions.forEach(option => {
        if (option.getAttribute('data-model') === model) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    // 選択されたモデルを保存
    selectedModelProvider = model;
    
    // APIキーの状態に基づいてボタンの有効/無効を切り替え
    updateGenerateButtonState();
}

// 生成ボタンの状態を更新
function updateGenerateButtonState() {
    const hasRequiredApiKey = (selectedModelProvider === 'openai' && openaiApiKey) || 
                             (selectedModelProvider === 'gemini' && geminiApiKey);
    
    if (!hasRequiredApiKey) {
        generateBtn.disabled = true;
        generateBtn.title = `${selectedModelProvider === 'openai' ? 'OpenAI' : 'Gemini'} APIキーが設定されていません`;
    } else if (!navigator.onLine) {
        generateBtn.disabled = true;
        generateBtn.title = 'オフラインモードではプレゼンテーションを生成できません';
    } else {
        generateBtn.disabled = false;
        generateBtn.title = '';
    }
}

// APIキーモーダルの表示/非表示を切り替える
function toggleApiKeyModal() {
    apiKeyModal.classList.toggle('show');
    
    if (apiKeyModal.classList.contains('show')) {
        // モーダルが表示されたとき、現在のAPIキーを表示
        openaiApiKeyInput.value = openaiApiKey || '';
        geminiApiKeyInput.value = geminiApiKey || '';
        
        // 現在選択されているモデルのタブをアクティブにする
        switchModelTab(selectedModelProvider);
    }
}

// APIキーを保存する
async function saveApiKey() {
    const newOpenaiApiKey = openaiApiKeyInput.value.trim();
    const newGeminiApiKey = geminiApiKeyInput.value.trim();
    
    // 現在アクティブなタブを取得
    const activeTab = document.querySelector('.model-tab.active');
    const activeModel = activeTab.getAttribute('data-model');
    
    try {
        loadingMessage.textContent = 'APIキーを検証中...';
        loadingContainer.style.display = 'flex';
        
        // OpenAI APIキーの処理
        if (activeModel === 'openai') {
            if (!newOpenaiApiKey) {
                // APIキーが空の場合、ローカルストレージから削除
                localStorage.removeItem('openai_api_key');
                openaiApiKey = null;
                updateApiKeyStatus('openai', false);
                showNotification('OpenAI APIキーが削除されました', 'info');
                toggleApiKeyModal();
                loadingContainer.style.display = 'none';
                return;
            }
            
            // APIキーの形式を簡易チェック
            if (!newOpenaiApiKey.startsWith('sk-') || newOpenaiApiKey.length < 20) {
                showNotification('OpenAI APIキーの形式が正しくありません', 'error');
                loadingContainer.style.display = 'none';
                return;
            }
            
            // 静的モードの場合はクライアントサイドで検証
            if (isStaticMode) {
                // 簡易的な検証（実際のAPIコールはできないため形式のみチェック）
                localStorage.setItem('openai_api_key', newOpenaiApiKey);
                openaiApiKey = newOpenaiApiKey;
                updateApiKeyStatus('openai', true);
                showNotification('OpenAI APIキーが保存されました（検証なし）', 'success');
                toggleApiKeyModal();
                loadingContainer.style.display = 'none';
                return;
            }
            
            // サーバーモードの場合はAPIで検証
            try {
                const response = await fetch(API_VALIDATE_KEY_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ apiKey: newOpenaiApiKey, provider: 'openai' }),
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // APIキーが有効な場合、ローカルストレージに保存
                    localStorage.setItem('openai_api_key', newOpenaiApiKey);
                    openaiApiKey = newOpenaiApiKey;
                    updateApiKeyStatus('openai', true);
                    showNotification('OpenAI APIキーが正常に保存されました', 'success');
                } else {
                    showNotification(`OpenAI APIキーが無効です: ${data.message}`, 'error');
                    loadingContainer.style.display = 'none';
                    return;
                }
            } catch (error) {
                console.error('OpenAI APIキー検証エラー:', error);
                // エラーが発生した場合でも、形式が正しければ保存する
                localStorage.setItem('openai_api_key', newOpenaiApiKey);
                openaiApiKey = newOpenaiApiKey;
                updateApiKeyStatus('openai', true);
                showNotification('OpenAI APIキーを保存しました（サーバー検証失敗）', 'warning');
            }
        }
        // Gemini APIキーの処理
        else if (activeModel === 'gemini') {
            if (!newGeminiApiKey) {
                // APIキーが空の場合、ローカルストレージから削除
                localStorage.removeItem('gemini_api_key');
                geminiApiKey = null;
                updateApiKeyStatus('gemini', false);
                showNotification('Gemini APIキーが削除されました', 'info');
                toggleApiKeyModal();
                loadingContainer.style.display = 'none';
                return;
            }
            
            // APIキーの形式を簡易チェック
            if (!newGeminiApiKey.startsWith('AIzaSy') && !newGeminiApiKey.startsWith('AIza')) {
                showNotification('Gemini APIキーの形式が正しくありません。AIzaSyで始まる文字列を入力してください。', 'error');
                loadingContainer.style.display = 'none';
                return;
            }
            
            // 静的モードの場合はクライアントサイドで検証
            if (isStaticMode) {
                // 簡易的な検証（実際のAPIコールはできないため形式のみチェック）
                localStorage.setItem('gemini_api_key', newGeminiApiKey);
                geminiApiKey = newGeminiApiKey;
                updateApiKeyStatus('gemini', true);
                showNotification('Gemini APIキーが保存されました（検証なし）', 'success');
                toggleApiKeyModal();
                loadingContainer.style.display = 'none';
                return;
            }
            
            // サーバーモードの場合はAPIで検証
            try {
                const response = await fetch(API_VALIDATE_KEY_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ apiKey: newGeminiApiKey, provider: 'gemini' }),
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // APIキーが有効な場合、ローカルストレージに保存
                    localStorage.setItem('gemini_api_key', newGeminiApiKey);
                    geminiApiKey = newGeminiApiKey;
                    updateApiKeyStatus('gemini', true);
                    showNotification('Gemini APIキーが正常に保存されました', 'success');
                } else {
                    showNotification(`Gemini APIキーが無効です: ${data.message}`, 'error');
                    loadingContainer.style.display = 'none';
                    return;
                }
            } catch (error) {
                console.error('Gemini APIキー検証エラー:', error);
                // エラーが発生した場合でも、形式が正しければ保存する
                localStorage.setItem('gemini_api_key', newGeminiApiKey);
                geminiApiKey = newGeminiApiKey;
                updateApiKeyStatus('gemini', true);
                showNotification('Gemini APIキーを保存しました（サーバー検証失敗）', 'warning');
            }
        }
        
        // 生成ボタンの状態を更新
        updateGenerateButtonState();
        
        // モーダルを閉じる
        toggleApiKeyModal();
    } catch (error) {
        console.error('APIキー検証エラー:', error);
        showNotification('APIキーの検証中にエラーが発生しました', 'error');
    } finally {
        loadingContainer.style.display = 'none';
    }
}

// 保存されたAPIキーを読み込む
function loadApiKeys() {
    // OpenAI APIキーの読み込み
    const savedOpenaiApiKey = localStorage.getItem('openai_api_key');
    if (savedOpenaiApiKey) {
        openaiApiKey = savedOpenaiApiKey;
        updateApiKeyStatus('openai', true);
    } else {
        updateApiKeyStatus('openai', false);
    }
    
    // Gemini APIキーの読み込み
    const savedGeminiApiKey = localStorage.getItem('gemini_api_key');
    if (savedGeminiApiKey) {
        geminiApiKey = savedGeminiApiKey;
        updateApiKeyStatus('gemini', true);
    } else {
        updateApiKeyStatus('gemini', false);
    }
    
    // 生成ボタンの状態を更新
    updateGenerateButtonState();
}

// APIキーの状態表示を更新
function updateApiKeyStatus(provider, isSet) {
    const statusElement = provider === 'openai' ? openaiApiKeyStatus : geminiApiKeyStatus;
    
    if (isSet) {
        statusElement.className = 'api-key-status set';
        statusElement.innerHTML = '<i class="fas fa-check-circle"></i><span>APIキーが設定されています</span>';
    } else {
        statusElement.className = 'api-key-status not-set';
        statusElement.innerHTML = '<i class="fas fa-times-circle"></i><span>APIキーが設定されていません</span>';
    }
    
    // APIキートグルボタンの色を更新
    if ((provider === 'openai' && openaiApiKey) || (provider === 'gemini' && geminiApiKey)) {
        apiKeyToggle.style.backgroundColor = '#28a745';
    } else if (!openaiApiKey && !geminiApiKey) {
        apiKeyToggle.style.backgroundColor = '';
    }
}

// フィードバックフォームの表示/非表示を切り替える
function toggleFeedbackForm() {
    feedbackForm.classList.
(Content truncated due to size limit. Use line ranges to read in chunks)