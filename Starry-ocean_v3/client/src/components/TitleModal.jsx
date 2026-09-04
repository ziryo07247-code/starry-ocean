// client/src/components/TitleModal.jsx

import React from "react";
import "../components_css/TitleModal.css";

// 메모 제목을 입력받는 모달
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
        {/* 제목 입력 */}
        <h3>✨ 별의 이름을 지어주세요</h3>

        <p>내용: {content}</p>

        <input
          type="text"
          className="title-modal-input"
          placeholder="별의 이름 (제목)을 입력하세요"
          value={memoTitle}
          onChange={onChangeTitle}
          autoFocus
        />

        {/* 모달 버튼 */}
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
