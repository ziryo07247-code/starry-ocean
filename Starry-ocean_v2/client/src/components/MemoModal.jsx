import React, { useState } from "react";
import "../components_css/MemoModal.css";

// 메모 상세 및 섬 이동 모달
function MemoModal({ memo, islands = [], onClose, onDelete, onMoveMemo }) {
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [selectedIslandId, setSelectedIslandId] = useState("");
  const [moving, setMoving] = useState(false);

  if (!memo) return null;

  // 현재 메모가 속한 섬을 제외
  const availableIslands = islands.filter(
    (island) => island.id !== memo.island_id,
  );

  // 메모를 다른 섬으로 이동
  const handleMove = async () => {
    if (!selectedIslandId) {
      alert("이동할 섬을 선택해주세요.");
      return;
    }

    setMoving(true);

    try {
      await onMoveMemo(memo.id, Number(selectedIslandId));

      alert("메모가 새로운 섬으로 이동되었습니다. 🚀");
      onClose();
    } catch (error) {
      console.error("메모 이동 실패:", error);
      alert("메모 이동 중 오류가 발생했습니다.");
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="memo-modal-overlay" onClick={onClose}>
      <div className="memo-modal" onClick={(e) => e.stopPropagation()}>
        {/* 제목 */}
        <div className="memo-modal-header">
          <h2 className="memo-modal-title">
            ⭐ {memo.title || memo.name || "무명의 별"}
          </h2>

          <button className="memo-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 메모 내용 */}
        <div className="memo-content">{memo.content}</div>

        {/* 섬 이동 */}
        {isMoveMode && availableIslands.length > 0 && (
          <div className="memo-move-section">
            <div className="memo-move-title">🌊 다른 섬으로 이동</div>

            <select
              className="island-select"
              value={selectedIslandId}
              onChange={(e) => setSelectedIslandId(e.target.value)}
              disabled={moving}
            >
              <option value="">이동할 섬을 선택하세요</option>

              {availableIslands.map((island) => (
                <option key={island.id} value={island.id}>
                  {island.name}
                </option>
              ))}
            </select>

            <button
              className="confirm-move-button"
              onClick={handleMove}
              disabled={moving || !selectedIslandId}
            >
              {moving ? "🚀 이동 중..." : "🚀 이 섬으로 이동"}
            </button>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="memo-modal-actions">
          <button className="memo-close-button" onClick={onClose}>
            닫기
          </button>

          <button
            className="memo-delete-button"
            onClick={() => onDelete(memo.id)}
          >
            🗑️ 삭제
          </button>
        </div>

        {/* 섬 이동 모드 진입 */}
        {!isMoveMode && (
          <button
            className="memo-move-button"
            onClick={() => setIsMoveMode(true)}
          >
            🏝️ 다른 섬으로 이동
          </button>
        )}
      </div>
    </div>
  );
}

export default MemoModal;
