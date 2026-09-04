// client/src/components/MemoModal.jsx
import React, { useState } from "react";

function MemoModal({ memo, islands = [], onClose, onDelete, onMoveMemo }) {
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [selectedIslandId, setSelectedIslandId] = useState("");
  const [moving, setMoving] = useState(false);

  if (!memo) return null;

  // 현재 메모가 속한 섬을 제외한 섬 목록
  const availableIslands = islands.filter(
    (island) => island.id !== memo.island_id,
  );

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
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 8, 20, 0.75)",
        backdropFilter: "blur(10px)",
        zIndex: 3000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "420px",
          maxWidth: "90%",
          background: "rgba(15, 23, 42, 0.96)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "20px",
          padding: "28px",
          color: "#fff",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              color: "#a5b4fc",
            }}
          >
            ⭐ {memo.title || memo.name || "무명의 별"}
          </h2>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* 메모 내용 */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "18px",
            marginBottom: "20px",
            lineHeight: "1.7",
            fontSize: "15px",
            color: "rgba(255,255,255,0.9)",
            whiteSpace: "pre-wrap",
          }}
        >
          {memo.content}
        </div>

        {/* 섬 이동 */}
        {isMoveMode && availableIslands.length > 0 && (
          <div
            style={{
              marginBottom: "20px",
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#c7d2fe",
              }}
            >
              🌊 다른 섬으로 이동
            </div>

            <select
              value={selectedIslandId}
              onChange={(e) => setSelectedIslandId(e.target.value)}
              disabled={moving}
              style={{
                width: "100%",
                padding: "11px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "#1e293b",
                color: "#fff",
                outline: "none",
                marginBottom: "10px",
                cursor: "pointer",
              }}
            >
              <option value="">이동할 섬을 선택하세요</option>

              {availableIslands.map((island) => (
                <option key={island.id} value={island.id}>
                  {island.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleMove}
              disabled={moving || !selectedIslandId}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: "8px",
                border: "none",
                background:
                  moving || !selectedIslandId
                    ? "rgba(255,255,255,0.1)"
                    : "linear-gradient(135deg, #6366f1, #818cf8)",
                color: "#fff",
                fontWeight: "bold",
                cursor: moving || !selectedIslandId ? "not-allowed" : "pointer",
              }}
            >
              {moving ? "🚀 이동 중..." : "🚀 이 섬으로 이동"}
            </button>
          </div>
        )}

        {/* 하단 버튼 */}
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            닫기
          </button>

          <button
            onClick={() => onDelete(memo.id)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: "rgba(239,68,68,0.15)",
              color: "#fca5a5",
              cursor: "pointer",
            }}
          >
            🗑️ 삭제
          </button>
        </div>
        <button
          onClick={() => setIsMoveMode(true)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            borderRadius: "10px",
            border: "1px solid rgba(165, 180, 252, 0.3)",
            background: "rgba(99, 102, 241, 0.15)",
            color: "#a5b4fc",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          🏝️ 다른 섬으로 이동
        </button>
      </div>
    </div>
  );
}

export default MemoModal;
