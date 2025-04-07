// UI コンポーネント - ダウンロード、フィードバック、編集機能のUI実装

// ダウンロードメニューを作成
export const createDownloadMenu = (containerId, callbacks) => {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // ダウンロードメニューの HTML
  const menuHTML = `
    <div class="download-menu">
      <button class="download-option" data-format="pdf">
        <i class="fas fa-file-pdf"></i> PDF形式
      </button>
      <button class="download-option" data-format="svg">
        <i class="fas fa-file-image"></i> SVG形式
      </button>
      <button class="download-option" data-format="png">
        <i class="fas fa-file-image"></i> PNG形式
      </button>
      <div class="download-divider"></div>
      <button class="download-option" data-action="current">
        <i class="fas fa-file"></i> 現在のスライドのみ
      </button>
      <button class="download-option" data-action="all">
        <i class="fas fa-files"></i> すべてのスライド
      </button>
    </div>
  `;

  // メニューを挿入
  container.innerHTML = menuHTML;

  // イベントリスナーを設定
  const options = container.querySelectorAll('.download-option');
  options.forEach(option => {
    option.addEventListener('click', (e) => {
      const format = e.currentTarget.getAttribute('data-format');
      const action = e.currentTarget.getAttribute('data-action');

      if (format && callbacks.onFormatSelect) {
        callbacks.onFormatSelect(format);
      }

      if (action && callbacks.onActionSelect) {
        callbacks.onActionSelect(action);
      }
    });
  });

  return container;
};

// フィードバックモーダルを作成
export const createFeedbackModal = (containerId, callbacks) => {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // フィードバックモーダルの HTML
  const modalHTML = `
    <div class="feedback-modal">
      <div class="modal-header">
        <h3>スライドへのフィードバック</h3>
        <button class="modal-close" aria-label="閉じる">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="rating-container">
          <p>このスライドの評価：</p>
          <div class="star-rating">
            <span class="star" data-rating="1"><i class="far fa-star"></i></span>
            <span class="star" data-rating="2"><i class="far fa-star"></i></span>
            <span class="star" data-rating="3"><i class="far fa-star"></i></span>
            <span class="star" data-rating="4"><i class="far fa-star"></i></span>
            <span class="star" data-rating="5"><i class="far fa-star"></i></span>
          </div>
        </div>
        <div class="form-group">
          <label for="feedback-comment">コメント：</label>
          <textarea id="feedback-comment" placeholder="このスライドについてのフィードバックを入力してください"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" data-action="cancel">キャンセル</button>
        <button class="btn-primary" data-action="submit">送信</button>
      </div>
    </div>
  `;

  // モーダルを挿入
  container.innerHTML = modalHTML;

  // 評価の選択
  let selectedRating = 0;
  const stars = container.querySelectorAll('.star');
  stars.forEach(star => {
    star.addEventListener('click', (e) => {
      const rating = parseInt(e.currentTarget.getAttribute('data-rating'));
      selectedRating = rating;
      
      // 星のスタイルを更新
      stars.forEach((s, index) => {
        const starIcon = s.querySelector('i');
        if (index < rating) {
          starIcon.className = 'fas fa-star';
        } else {
          starIcon.className = 'far fa-star';
        }
      });
    });

    // ホバー効果
    star.addEventListener('mouseenter', (e) => {
      const rating = parseInt(e.currentTarget.getAttribute('data-rating'));
      
      stars.forEach((s, index) => {
        const starIcon = s.querySelector('i');
        if (index < rating) {
          starIcon.className = 'fas fa-star';
        } else {
          starIcon.className = 'far fa-star';
        }
      });
    });

    star.addEventListener('mouseleave', () => {
      stars.forEach((s, index) => {
        const starIcon = s.querySelector('i');
        if (index < selectedRating) {
          starIcon.className = 'fas fa-star';
        } else {
          starIcon.className = 'far fa-star';
        }
      });
    });
  });

  // ボタンのイベントリスナー
  const submitBtn = container.querySelector('[data-action="submit"]');
  const cancelBtn = container.querySelector('[data-action="cancel"]');
  const closeBtn = container.querySelector('.modal-close');

  if (submitBtn && callbacks.onSubmit) {
    submitBtn.addEventListener('click', () => {
      const comment = container.querySelector('#feedback-comment').value;
      callbacks.onSubmit({
        rating: selectedRating,
        comment: comment
      });
    });
  }

  if (cancelBtn && callbacks.onCancel) {
    cancelBtn.addEventListener('click', callbacks.onCancel);
  }

  if (closeBtn && callbacks.onCancel) {
    closeBtn.addEventListener('click', callbacks.onCancel);
  }

  return container;
};

// 編集モードのツールバーを作成
export const createEditingToolbar = (containerId, callbacks) => {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // ツールバーの HTML
  const toolbarHTML = `
    <div class="editing-toolbar">
      <div class="toolbar-group">
        <button class="toolbar-btn" data-action="undo" title="元に戻す">
          <i class="fas fa-undo"></i>
        </button>
        <button class="toolbar-btn" data-action="redo" title="やり直す">
          <i class="fas fa-redo"></i>
        </button>
      </div>
      <div class="toolbar-group">
        <button class="toolbar-btn" data-action="add-slide" title="スライドを追加">
          <i class="fas fa-plus"></i>
        </button>
        <button class="toolbar-btn" data-action="delete-slide" title="スライドを削除">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      <div class="toolbar-group">
        <button class="toolbar-btn" data-action="move-up" title="上に移動">
          <i class="fas fa-arrow-up"></i>
        </button>
        <button class="toolbar-btn" data-action="move-down" title="下に移動">
          <i class="fas fa-arrow-down"></i>
        </button>
      </div>
      <div class="toolbar-group">
        <button class="toolbar-btn" data-action="edit-content" title="内容を編集">
          <i class="fas fa-edit"></i>
        </button>
        <button class="toolbar-btn" data-action="change-type" title="スライドタイプを変更">
          <i class="fas fa-exchange-alt"></i>
        </button>
      </div>
      <div class="toolbar-group">
        <button class="toolbar-btn" data-action="save" title="保存">
          <i class="fas fa-save"></i>
        </button>
        <button class="toolbar-btn" data-action="cancel" title="キャンセル">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `;

  // ツールバーを挿入
  container.innerHTML = toolbarHTML;

  // ボタンのイベントリスナー
  const buttons = container.querySelectorAll('.toolbar-btn');
  buttons.forEach(button => {
    const action = button.getAttribute('data-action');
    if (action && callbacks[action]) {
      button.addEventListener('click', callbacks[action]);
    }
  });

  return container;
};

// スライド編集モーダルを作成
export const createSlideEditModal = (containerId, slide, callbacks) => {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // スライドタイプのオプション
  const slideTypeOptions = [
    { value: 'title', label: 'タイトルスライド' },
    { value: 'content', label: '通常コンテンツ' },
    { value: 'bullets', label: '箇条書きリスト' },
    { value: 'image', label: '画像スライド' },
    { value: 'quote', label: '引用' },
    { value: 'twoColumn', label: '2カラム' },
    { value: 'final', label: '最終スライド' }
  ];

  // スライドタイプのオプションHTML
  const typeOptionsHTML = slideTypeOptions.map(option => 
    `<option value="${option.value}" ${slide.type === option.value ? 'selected' : ''}>${option.label}</option>`
  ).join('');

  // モーダルの HTML
  const modalHTML = `
    <div class="slide-edit-modal">
      <div class="modal-header">
        <h3>スライドを編集</h3>
        <button class="modal-close" aria-label="閉じる">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="slide-type">スライドタイプ：</label>
          <select id="slide-type">
            ${typeOptionsHTML}
          </select>
        </div>
        <div class="form-group">
          <label for="slide-title">タイトル：</label>
          <input type="text" id="slide-title" value="${slide.title || ''}">
        </div>
        <div class="form-group">
          <label for="slide-content">内容：</label>
          <textarea id="slide-content">${slide.content || ''}</textarea>
        </div>
        <div class="form-group">
          <label for="slide-notes">発表者ノート：</label>
          <textarea id="slide-notes">${slide.notes || ''}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" data-action="cancel">キャンセル</button>
        <button class="btn-primary" data-action="save">保存</button>
      </div>
    </div>
  `;

  // モーダルを挿入
  container.innerHTML = modalHTML;

  // スライドタイプの変更時の処理
  const typeSelect = container.querySelector('#slide-type');
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      const newType = e.target.value;
      // スライドタイプに応じたUIの調整があれば実装
    });
  }

  // ボタンのイベントリスナー
  const saveBtn = container.querySelector('[data-action="save"]');
  const cancelBtn = container.querySelector('[data-action="cancel"]');
  const closeBtn = container.querySelector('.modal-close');

  if (saveBtn && callbacks.onSave) {
    saveBtn.addEventListener('click', () => {
      const updatedSlide = {
        type: container.querySelector('#slide-type').value,
        title: container.querySelector('#slide-title').value,
        content: container.querySelector('#slide-content').value,
        notes: container.querySelector('#slide-notes').value
      };
      callbacks.onSave(updatedSlide);
    });
  }

  if (cancelBtn && callbacks.onCancel) {
    cancelBtn.addEventListener('click', callbacks.onCancel);
  }

  if (closeBtn && callbacks.onCancel) {
    closeBtn.addEventListener('click', callbacks.onCancel);
  }

  return container;
};

// フィードバック表示コンポーネントを作成
export const createFeedbackDisplay = (containerId, feedbackItems) => {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (!feedbackItems || feedbackItems.length === 0) {
    container.innerHTML = '<p class="no-feedback">まだフィードバックはありません。</p>';
    return container;
  }

  // フィードバック一覧のHTML
  let feedbackHTML = '<div class="feedback-list">';
  
  feedbackItems.forEach((item, index) => {
    const date = new Date(item.timestamp).toLocaleString('ja-JP');
    const stars = Array(5).fill(0).map((_, i) => 
      i < item.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>'
    ).join('');
    
    feedbackHTML += `
      <div class="feedback-item" data-index="${index}">
        <div class="feedback-header">
          <div class="feedback-rating">${stars}</div>
          <div class="feedback-date">${date}</div>
        </div>
        <div class="feedback-comment">${item.comment || '(コメントなし)'}</div>
      </div>
    `;
  });
  
  feedbackHTML += '</div>';
  
  // 平均評価の計算
  const avgRating = feedbackItems.reduce((sum, item) => sum + item.rating, 0) / feedbackItems.length;
  const avgStars = Array(5).fill(0).map((_, i) => {
    if (i < Math.floor(avgRating)) {
      return '<i class="fas fa-star"></i>';
    } else if (i < Math.ceil(avgRating) && avgRating % 1 !== 0) {
      return '<i class="fas fa-star-half-alt"></i>';
    } else {
      return '<i class="far fa-star"></i>';
    }
  }).join('');
  
  // 平均評価のHTML
  const summaryHTML = `
    <div class="feedback-summary">
      <div class="average-rating">
        <span>平均評価：</span>
        <div class="stars">${avgStars}</div>
        <span class="rating-value">${avgRating.toFixed(1)}</span>
      </div>
      <div class="feedback-count">
        <span>フィードバック数：</span>
        <span class="count-value">${feedbackItems.length}</span>
      </div>
    </div>
  `;
  
  // コンテナに挿入
  container.innerHTML = summaryHTML + feedbackHTML;
  
  return container;
};

// スライドのサムネイル一覧を作成（編集モード用）
export const createSlideThumbnails = (containerId, slides, callbacks) => {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // サムネイル一覧のHTML
  let thumbnailsHTML = '<div class="slide-thumbnails">';
  
  slides.forEach((slide, index) => {
    thumbnailsHTML += `
      <div class="slide-thumbnail" data-index="${index}">
        <div class="thumbnail-number">${index + 1}</div>
        <div class="thumbnail-title">${slide.title || 'スライド ' + (index + 1)}</div>
        <div class="thumbnail-type">${getSlideTypeName(slide.type)}</div>
      </div>
    `;
  });
  
  thumbnailsHTML += '</div>';
  
  // コンテナに挿入
  container.innerHTML = thumbnailsHTML;
  
  // サムネイルのクリックイベント
  const thumbnails = container.querySelectorAll('.slide-thumbnail');
  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.getAttribute('data-index'));
      if (callbacks.onSelect) {
        callbacks.onSelect(index);
      }
    });
  });
  
  return container;
};

// スライドタイプの日本語名を取得
function getSlideTypeName(type) {
  const typeMap = {
    'title': 'タイトル',
    'content': '通常コンテンツ',
    'bullets': '箇条書き',
    'image': '画像',
    'quote': '引用',
    'twoColumn': '2カラム',
    'final': '最終'
  };
  
  return typeMap[type] || type;
}

// 通知メッセージを表示
export const showNotification = (message, type = 'info', duration = 3000) => {
  // 既存の通知を削除
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => {
    notification.remove();
  });
  
  // 通知要素を作成
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // アイコンを設定
  let icon;
  switch (type) {
    case 'success':
      icon = 'check-circle';
      break;
    case 'error':
      icon = 'exclamation-circle';
      break;
    case 'warning':
      icon = 'exclamation-triangle';
      break;
    default:
      icon = 'info-circle';
  }
  
  // 通知のHTML
  notification.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
    <button class="notification-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // bodyに追加
  document.body.appendChild(notification);
  
  // 閉じるボタンのイベント
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
  }
  
  // 表示アニメーション
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // 自動的に閉じる
  if (duration > 0) {
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }
  
  return notification;
};
