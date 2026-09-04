// client/src/components/AddIslandModal.jsx
import "../components_css/AddIslandModal.css";

// 새로운 섬을 추가하는 모달
function AddIslandModal({
  isOpen,
  name,
  subtitle,
  onChangeName,
  onChangeSubtitle,
  onSubmit,
  onClose,
}) {
  // 모달이 닫혀 있으면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    // 모달 외부 클릭 시 닫기
    <div className="modal-overlay" onClick={onClose}>
      {/* 모달 내부 클릭 시 닫히지 않도록 이벤트 전파 차단 */}
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="modal-header">
          <h3 className="modal-title">✨ 새로운 섬 개척</h3>

          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 섬 정보 입력 */}
        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-group">
            <label>섬 이름</label>

            <input
              type="text"
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="예: 5호: 꿈꾸는 안개 숲"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>섬 부제 / 설명</label>

            <input
              type="text"
              value={subtitle}
              onChange={(e) => onChangeSubtitle(e.target.value)}
              placeholder="예: 깊은 상상력이 자라나는 신비로운 공간"
              className="form-input"
            />
          </div>

          {/* 섬 생성 */}
          <button type="submit" className="modal-submit-btn">
            개척 완료하기 🚀
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddIslandModal;
