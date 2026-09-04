// client/src/components/TitleModal.jsx
import React from "react";

function TitleModal({
  isOpen,
  content,
  memoTitle,
  onChangeTitle,
  onSubmit,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="title-modal-overlay" onClick={onClose}>
      <div className="title-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>✨ 별의 이름을 지어주세요</h3>
        <p>내용: {content}</p>

        <input
          type="text"
          className="title-modal-input"
          placeholder="예: 첫 번째 코딩 아이디어"
          value={memoTitle}
          onChange={onChangeTitle}
          autoFocus
        />

        <div className="title-modal-buttons">
          <button
            type="button"
            className="title-modal-cancel-btn"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className="title-modal-submit-btn"
            onClick={onSubmit}
          >
            별 띄우기 ✨
          </button>
        </div>
      </div>
    </div>
  );
}

export default TitleModal;
