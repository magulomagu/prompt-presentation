// フィードバック機能のユーティリティ関数

// フィードバックデータの構造
// {
//   slideIndex: 数値,
//   rating: 1-5の数値,
//   comment: 文字列,
//   timestamp: 日時
// }

// フィードバックをローカルストレージに保存
export const saveFeedback = (presentationId, feedback) => {
  try {
    // 既存のフィードバックを取得
    const existingFeedback = getFeedbackForPresentation(presentationId) || [];
    
    // 新しいフィードバックを追加
    const newFeedback = {
      ...feedback,
      timestamp: new Date().toISOString()
    };
    
    const updatedFeedback = [...existingFeedback, newFeedback];
    
    // ローカルストレージに保存
    localStorage.setItem(`feedback_${presentationId}`, JSON.stringify(updatedFeedback));
    
    return true;
  } catch (error) {
    console.error('Error saving feedback:', error);
    return false;
  }
};

// プレゼンテーションのすべてのフィードバックを取得
export const getFeedbackForPresentation = (presentationId) => {
  try {
    const feedbackData = localStorage.getItem(`feedback_${presentationId}`);
    return feedbackData ? JSON.parse(feedbackData) : [];
  } catch (error) {
    console.error('Error retrieving feedback:', error);
    return [];
  }
};

// 特定のスライドのフィードバックを取得
export const getFeedbackForSlide = (presentationId, slideIndex) => {
  try {
    const allFeedback = getFeedbackForPresentation(presentationId);
    return allFeedback.filter(item => item.slideIndex === slideIndex);
  } catch (error) {
    console.error('Error retrieving slide feedback:', error);
    return [];
  }
};

// フィードバックの平均評価を計算
export const getAverageRating = (presentationId, slideIndex = null) => {
  try {
    let feedback;
    
    if (slideIndex !== null) {
      // 特定のスライドの評価
      feedback = getFeedbackForSlide(presentationId, slideIndex);
    } else {
      // プレゼンテーション全体の評価
      feedback = getFeedbackForPresentation(presentationId);
    }
    
    if (feedback.length === 0) return 0;
    
    const sum = feedback.reduce((total, item) => total + item.rating, 0);
    return sum / feedback.length;
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return 0;
  }
};

// フィードバックを削除
export const deleteFeedback = (presentationId, feedbackIndex) => {
  try {
    const feedback = getFeedbackForPresentation(presentationId);
    
    if (feedbackIndex >= 0 && feedbackIndex < feedback.length) {
      feedback.splice(feedbackIndex, 1);
      localStorage.setItem(`feedback_${presentationId}`, JSON.stringify(feedback));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return false;
  }
};

// すべてのフィードバックをクリア
export const clearAllFeedback = (presentationId) => {
  try {
    localStorage.removeItem(`feedback_${presentationId}`);
    return true;
  } catch (error) {
    console.error('Error clearing feedback:', error);
    return false;
  }
};

// フィードバックをエクスポート
export const exportFeedback = (presentationId) => {
  try {
    const feedback = getFeedbackForPresentation(presentationId);
    const jsonString = JSON.stringify(feedback, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_${presentationId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error('Error exporting feedback:', error);
    return false;
  }
};
