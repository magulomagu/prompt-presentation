// 新機能のテスト用スクリプト
import { 
  downloadAsPDF, 
  downloadAsSVG, 
  downloadAsPNG, 
  downloadCurrentSlide,
  downloadAllSlides 
} from './download-utils.js';

import {
  saveFeedback,
  getFeedbackForPresentation,
  getFeedbackForSlide,
  getAverageRating,
  deleteFeedback,
  clearAllFeedback,
  exportFeedback
} from './feedback-utils.js';

import {
  startEditing,
  updateSlide,
  addSlide,
  deleteSlide,
  reorderSlides,
  undoEdit,
  redoEdit,
  resetEdits,
  finalizeEdits,
  clearEditSession
} from './editing-utils.js';

import {
  createDownloadMenu,
  createFeedbackModal,
  createEditingToolbar,
  createSlideEditModal,
  createFeedbackDisplay,
  createSlideThumbnails,
  showNotification
} from './ui-components.js';

// テスト用関数
const testFeatures = () => {
  console.log('新機能のテストを開始します...');
  
  // ダウンロード機能のテスト
  testDownloadFeatures();
  
  // フィードバック機能のテスト
  testFeedbackFeatures();
  
  // 編集機能のテスト
  testEditingFeatures();
  
  // UI統合のテスト
  testUIIntegration();
  
  console.log('すべてのテストが完了しました');
};

// ダウンロード機能のテスト
const testDownloadFeatures = () => {
  console.log('ダウンロード機能のテスト...');
  
  // テスト用のダミー要素を作成
  const testElement = document.createElement('div');
  testElement.id = 'test-slide';
  testElement.innerHTML = '<h1>テストスライド</h1><p>これはテスト用のコンテンツです。</p>';
  document.body.appendChild(testElement);
  
  // 各ダウンロード形式をテスト
  try {
    // PDF形式
    console.log('PDF形式のダウンロードをテスト中...');
    downloadAsPDF('test-slide', 'test-pdf.pdf');
    
    // SVG形式
    console.log('SVG形式のダウンロードをテスト中...');
    downloadAsSVG('test-slide', 'test-svg.svg');
    
    // PNG形式
    console.log('PNG形式のダウンロードをテスト中...');
    downloadAsPNG('test-slide', 'test-png.png');
    
    // 現在のスライドのダウンロード
    console.log('現在のスライドのダウンロードをテスト中...');
    downloadCurrentSlide('pdf', 'test-slide', 0);
    
    // 全スライドのダウンロード
    console.log('全スライドのダウンロードをテスト中...');
    downloadAllSlides('test-slide', 1, 'test-presentation');
    
    console.log('ダウンロード機能のテストが完了しました');
  } catch (error) {
    console.error('ダウンロード機能のテスト中にエラーが発生しました:', error);
  }
  
  // テスト用要素を削除
  document.body.removeChild(testElement);
};

// フィードバック機能のテスト
const testFeedbackFeatures = () => {
  console.log('フィードバック機能のテスト...');
  
  const testPresentationId = 'test-presentation';
  
  try {
    // フィードバックの保存
    console.log('フィードバックの保存をテスト中...');
    saveFeedback(testPresentationId, {
      slideIndex: 0,
      rating: 4,
      comment: 'これはテスト用のフィードバックです。'
    });
    
    saveFeedback(testPresentationId, {
      slideIndex: 1,
      rating: 5,
      comment: '素晴らしいスライドです！'
    });
    
    // フィードバックの取得
    console.log('フィードバックの取得をテスト中...');
    const allFeedback = getFeedbackForPresentation(testPresentationId);
    console.log('すべてのフィードバック:', allFeedback);
    
    const slideFeedback = getFeedbackForSlide(testPresentationId, 0);
    console.log('スライド0のフィードバック:', slideFeedback);
    
    // 平均評価の計算
    console.log('平均評価の計算をテスト中...');
    const avgRating = getAverageRating(testPresentationId);
    console.log('平均評価:', avgRating);
    
    // フィードバックのエクスポート
    console.log('フィードバックのエクスポートをテスト中...');
    exportFeedback(testPresentationId);
    
    // フィードバックの削除
    console.log('フィードバックの削除をテスト中...');
    deleteFeedback(testPresentationId, 0);
    
    // すべてのフィードバックをクリア
    console.log('すべてのフィードバックのクリアをテスト中...');
    clearAllFeedback(testPresentationId);
    
    console.log('フィードバック機能のテストが完了しました');
  } catch (error) {
    console.error('フィードバック機能のテスト中にエラーが発生しました:', error);
  }
};

// 編集機能のテスト
const testEditingFeatures = () => {
  console.log('編集機能のテスト...');
  
  const testPresentationId = 'test-presentation';
  const testPresentation = {
    id: testPresentationId,
    title: 'テストプレゼンテーション',
    slides: [
      {
        type: 'title',
        title: 'テストプレゼンテーション',
        content: 'これはテスト用のプレゼンテーションです。'
      },
      {
        type: 'content',
        title: 'テストスライド2',
        content: 'これはテスト用のコンテンツです。'
      }
    ]
  };
  
  try {
    // 編集セッションの開始
    console.log('編集セッションの開始をテスト中...');
    const editSession = startEditing(testPresentation);
    console.log('編集セッション:', editSession);
    
    // スライドの更新
    console.log('スライドの更新をテスト中...');
    const updatedSession = updateSlide(testPresentationId, 0, {
      title: '更新されたタイトル',
      content: '更新されたコンテンツ'
    });
    console.log('更新後のセッション:', updatedSession);
    
    // スライドの追加
    console.log('スライドの追加をテスト中...');
    const newSlide = {
      type: 'bullets',
      title: '新しいスライド',
      content: '- 項目1\n- 項目2\n- 項目3'
    };
    const sessionWithNewSlide = addSlide(testPresentationId, newSlide);
    console.log('スライド追加後のセッション:', sessionWithNewSlide);
    
    // スライドの削除
    console.log('スライドの削除をテスト中...');
    const sessionAfterDelete = deleteSlide(testPresentationId, 1);
    console.log('スライド削除後のセッション:', sessionAfterDelete);
    
    // スライドの順序変更
    console.log('スライドの順序変更をテスト中...');
    const reorderedSession = reorderSlides(testPresentationId, 0, 1);
    console.log('順序変更後のセッション:', reorderedSession);
    
    // 元に戻す
    console.log('元に戻す操作をテスト中...');
    const undoSession = undoEdit(testPresentationId);
    console.log('元に戻した後のセッション:', undoSession);
    
    // やり直す
    console.log('やり直し操作をテスト中...');
    const redoSession = redoEdit(testPresentationId);
    console.log('やり直した後のセッション:', redoSession);
    
    // 編集のリセット
    console.log('編集のリセットをテスト中...');
    const resetSession = resetEdits(testPresentationId);
    console.log('リセット後のセッション:', resetSession);
    
    // 編集の確定
    console.log('編集の確定をテスト中...');
    const finalizedEdits = finalizeEdits(testPresentationId);
    console.log('確定された編集:', finalizedEdits);
    
    // 編集セッションのクリア
    console.log('編集セッションのクリアをテスト中...');
    clearEditSession(testPresentationId);
    
    console.log('編集機能のテストが完了しました');
  } catch (error) {
    console.error('編集機能のテスト中にエラーが発生しました:', error);
  }
};

// UI統合のテスト
const testUIIntegration = () => {
  console.log('UI統合のテスト...');
  
  try {
    // テスト用のコンテナ要素を作成
    const testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    document.body.appendChild(testContainer);
    
    // ダウンロードメニューのテスト
    console.log('ダウンロードメニューのテスト中...');
    createDownloadMenu('test-container', {
      onFormatSelect: (format) => console.log('選択された形式:', format),
      onActionSelect: (action) => console.log('選択されたアクション:', action)
    });
    
    // UIをクリア
    testContainer.innerHTML = '';
    
    // フィードバックモーダルのテスト
    console.log('フィードバックモーダルのテスト中...');
    createFeedbackModal('test-container', {
      onSubmit: (data) => console.log('送信されたフィードバック:', data),
      onCancel: () => console.log('フィードバックがキャンセルされました')
    });
    
    // UIをクリア
    testContainer.innerHTML = '';
    
    // 編集ツールバーのテスト
    console.log('編集ツールバーのテスト中...');
    createEditingToolbar('test-container', {
      undo: () => console.log('元に戻す'),
      redo: () => console.log('やり直す'),
      'add-slide': () => console.log('スライドを追加'),
      'delete-slide': () => console.log('スライドを削除'),
      'move-up': () => console.log('上に移動'),
      'move-down': () => console.log('下に移動'),
      'edit-content': () => console.log('内容を編集'),
      'change-type': () => console.log('タイプを変更'),
      save: () => console.log('保存'),
      cancel: () => console.log('キャンセル')
    });
    
    // UIをクリア
    testContainer.innerHTML = '';
    
    // スライド編集モーダルのテスト
    console.log('スライド編集モーダルのテスト中...');
    const testSlide = {
      type: 'content',
      title: 'テストスライド',
      content: 'これはテスト用のコンテンツです。',
      notes: '発表者ノート'
    };
    createSlideEditModal('test-container', testSlide, {
      onSave: (updatedSlide) => console.log('保存されたスライド:', updatedSlide),
      onCancel: () => console.log('編集がキャンセルされました')
    });
    
    // UIをクリア
    testContainer.innerHTML = '';
    
    // フィードバック表示のテスト
    console.log('フィードバック表示のテスト中...');
    const testFeedback = [
      {
        slideIndex: 0,
        rating: 4,
        comment: 'これはテスト用のフィードバックです。',
        timestamp: new Date().toISOString()
      },
      {
        slideIndex: 0,
        rating: 5,
        comment: '素晴らしいスライドです！',
        timestamp: new Date().toISOString()
      }
    ];
    createFeedbackDisplay('test-container', testFeedback);
    
    // UIをクリア
    testContainer.innerHTML = '';
    
    // スライドサムネイルのテスト
    console.log('スライドサムネイルのテスト中...');
    const testSlides = [
      {
        type: 'title',
        title: 'プレゼンテーションのタイトル'
      },
      {
        type: 'content',
        title: '通常コンテンツ'
      },
      {
        type: 'bullets',
        title: '箇条書きリスト'
      }
    ];
    createSlideThumbnails('test-container', testSlides, {
      onSelect: (index) => console.log('選択されたスライド:', index)
    });
    
    // UIをクリア
    testContainer.innerHTML = '';
    
    // 通知のテスト
    console.log('通知のテスト中...');
    showNotification('テスト通知です', 'info', 2000);
    setTimeout(() => {
      showNotification('成功しました！', 'success', 2000);
    }, 500);
    setTimeout(() => {
      showNotification('警告があります', 'warning', 2000);
    }, 1000);
    setTimeout(() => {
      showNotification('エラーが発生しました', 'error', 2000);
    }, 1500);
    
    // テスト用コンテナを削除
    setTimeout(() => {
      document.body.removeChild(testContainer);
    }, 3000);
    
    console.log('UI統合のテストが完了しました');
  } catch (error) {
    console.error('UI統合のテスト中にエラーが発生しました:', error);
  }
};

// テストの実行
window.runTests = testFeatures;

// ページ読み込み時に自動テスト実行（開発時のみ）
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('DOMContentLoaded', () => {
    console.log('開発モードでテストを自動実行します');
    setTimeout(testFeatures, 1000);
  });
}

export {
  testFeatures,
  testDownloadFeatures,
  testFeedbackFeatures,
  testEditingFeatures,
  testUIIntegration
};
