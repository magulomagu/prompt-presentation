// 編集機能のユーティリティ関数

// スライドの編集履歴を管理するための構造
// {
//   originalSlides: 元のスライド配列,
//   currentSlides: 現在編集中のスライド配列,
//   history: 編集履歴の配列,
//   currentIndex: 現在の履歴インデックス
// }

// 新しい編集セッションを開始
export const startEditing = (presentation) => {
  try {
    if (!presentation || !presentation.slides) {
      console.error('Invalid presentation data');
      return null;
    }
    
    // 編集セッションを作成
    const editSession = {
      originalSlides: JSON.parse(JSON.stringify(presentation.slides)),
      currentSlides: JSON.parse(JSON.stringify(presentation.slides)),
      history: [JSON.parse(JSON.stringify(presentation.slides))],
      currentIndex: 0
    };
    
    // ローカルストレージに保存
    saveEditSession(presentation.id || 'current', editSession);
    
    return editSession;
  } catch (error) {
    console.error('Error starting edit session:', error);
    return null;
  }
};

// 編集セッションを保存
export const saveEditSession = (presentationId, editSession) => {
  try {
    localStorage.setItem(`edit_session_${presentationId}`, JSON.stringify(editSession));
    return true;
  } catch (error) {
    console.error('Error saving edit session:', error);
    return false;
  }
};

// 編集セッションを取得
export const getEditSession = (presentationId) => {
  try {
    const sessionData = localStorage.getItem(`edit_session_${presentationId}`);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Error retrieving edit session:', error);
    return null;
  }
};

// スライドを更新
export const updateSlide = (presentationId, slideIndex, updatedSlide) => {
  try {
    const editSession = getEditSession(presentationId);
    if (!editSession) return false;
    
    // 現在のスライドを更新
    const updatedSlides = [...editSession.currentSlides];
    updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], ...updatedSlide };
    
    // 履歴に追加（現在位置以降の履歴は削除）
    const newHistory = editSession.history.slice(0, editSession.currentIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(updatedSlides)));
    
    // 編集セッションを更新
    const updatedSession = {
      ...editSession,
      currentSlides: updatedSlides,
      history: newHistory,
      currentIndex: newHistory.length - 1
    };
    
    // 保存
    saveEditSession(presentationId, updatedSession);
    
    return updatedSession;
  } catch (error) {
    console.error('Error updating slide:', error);
    return false;
  }
};

// スライドを追加
export const addSlide = (presentationId, newSlide, position = null) => {
  try {
    const editSession = getEditSession(presentationId);
    if (!editSession) return false;
    
    // 新しいスライド配列を作成
    const updatedSlides = [...editSession.currentSlides];
    
    // 位置が指定されていない場合は末尾に追加
    if (position === null || position >= updatedSlides.length) {
      updatedSlides.push(newSlide);
    } else {
      updatedSlides.splice(position, 0, newSlide);
    }
    
    // 履歴に追加
    const newHistory = editSession.history.slice(0, editSession.currentIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(updatedSlides)));
    
    // 編集セッションを更新
    const updatedSession = {
      ...editSession,
      currentSlides: updatedSlides,
      history: newHistory,
      currentIndex: newHistory.length - 1
    };
    
    // 保存
    saveEditSession(presentationId, updatedSession);
    
    return updatedSession;
  } catch (error) {
    console.error('Error adding slide:', error);
    return false;
  }
};

// スライドを削除
export const deleteSlide = (presentationId, slideIndex) => {
  try {
    const editSession = getEditSession(presentationId);
    if (!editSession || editSession.currentSlides.length <= 1) return false;
    
    // スライドを削除
    const updatedSlides = [...editSession.currentSlides];
    updatedSlides.splice(slideIndex, 1);
    
    // 履歴に追加
    const newHistory = editSession.history.slice(0, editSession.currentIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(updatedSlides)));
    
    // 編集セッションを更新
    const updatedSession = {
      ...editSession,
      currentSlides: updatedSlides,
      history: newHistory,
      currentIndex: newHistory.length - 1
    };
    
    // 保存
    saveEditSession(presentationId, updatedSession);
    
    return updatedSession;
  } catch (error) {
    console.error('Error deleting slide:', error);
    return false;
  }
};

// スライドの順序を変更
export const reorderSlides = (presentationId, fromIndex, toIndex) => {
  try {
    const editSession = getEditSession(presentationId);
    if (!editSession) return false;
    
    // スライドの順序を変更
    const updatedSlides = [...editSession.currentSlides];
    const [movedSlide] = updatedSlides.splice(fromIndex, 1);
    updatedSlides.splice(toIndex, 0, movedSlide);
    
    // 履歴に追加
    const newHistory = editSession.history.slice(0, editSession.currentIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(updatedSlides)));
    
    // 編集セッションを更新
    const updatedSession = {
      ...editSession,
      currentSlides: updatedSlides,
      history: newHistory,
      currentIndex: newHistory.length - 1
    };
    
    // 保存
    saveEditSession(presentationId, updatedSession);
    
    return updatedSession;
  } catch (error) {
    console.error('Error reordering slides:', error);
    return false;
  }
};

// 元に戻す（Undo）
export const undoEdit = (presentationId) => {
  try {
    const editSession = getEditSession(presentationId);
    if (!editSession || editSession.currentIndex <= 0) return false;
    
    // インデックスを1つ戻す
    const newIndex = editSession.currentIndex - 1;
    
    // 編集セッションを更新
    const updatedSession = {
      ...editSession,
      currentSlides: JSON.parse(JSON.stringify(editSession.history[newIndex])),
      currentIndex: newIndex
    };
    
    // 保存
    saveEditSession(presentationId, updatedSession);
    
    return updatedSession;
  } catch (error) {
    console.error('Error undoing edit:', error);
    return false;
  }
};

// やり直す（Redo）
export const redoEdit = (presentationId) => {
  try {
    const editSession = getEditSession(presentationId);
    if (!editSession || editSession.currentIndex >= editSession.history.length - 1) return false;
    
    // インデックスを1つ進める
    const newIndex = editSession.currentIndex + 1;
    
    // 編集セッションを更新
    const updatedSession = {
      ...editSession,
      currentSlides: JSON.parse(JSON.stringify(editSession.history[newIndex])),
      currentIndex: newIndex
    };
    
    // 保存
    saveEditSession(presentationId, updatedSession);
    
    return updatedSession;
  } catch (error) {
    console.error('Error redoing edit:', error);
    return false;
  }
};

// 編集をリセット
export const resetEdits = (presentationId) => {
  try {
    const editSession = getEditSession(presentationId);
    if (!editSession) return false;
    
    // 元のスライドに戻す
    const updatedSession = {
      ...editSession,
      currentSlides: JSON.parse(JSON.stringify(editSession.originalSlides)),
      history: [
        ...editSession.history,
        JSON.parse(JSON.stringify(editSession.originalSlides))
      ],
      currentIndex: editSession.history.length
    };
    
    // 保存
    saveEditSession(presentationId, updatedSession);
    
    return updatedSession;
  } catch (error) {
    console.error('Error resetting edits:', error);
    return false;
  }
};

// 編集を確定
export const finalizeEdits = (presentationId) => {
  try {
    const editSession = getEditSession(presentationId);
    if (!editSession) return null;
    
    // 現在の編集内容を返す
    return {
      slides: editSession.currentSlides
    };
  } catch (error) {
    console.error('Error finalizing edits:', error);
    return null;
  }
};

// 編集セッションを削除
export const clearEditSession = (presentationId) => {
  try {
    localStorage.removeItem(`edit_session_${presentationId}`);
    return true;
  } catch (error) {
    console.error('Error clearing edit session:', error);
    return false;
  }
};
