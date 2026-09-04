import React from "react";
import { useDragScroll } from "../hooks/useDragScroll";

function MapModal({
  isOpen,
  islands = [],
  currentIsland,
  onClose,
  onJumpToIsland,
  onOpenAddIsland,
  onDeleteIsland,
}) {
  const {
    fieldRef: rowRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
  } = useDragScroll();

  if (!isOpen) return null;

  const handleJump = (index) => {
    onJumpToIsland(index);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(3, 7, 18, 0.82)",
        backdropFilter: "blur(12px)",
        zIndex: 2000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "700px",
          maxWidth: "90vw",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "28px",
          borderRadius: "22px",
          background: "rgba(10, 18, 38, 0.96)",
          border: "1px solid rgba(165, 180, 252, 0.2)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.7)",
          color: "#fff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
                color: "#c7d2fe",
              }}
            >
              🧭 스타리 오션 전체 지도
            </h2>

            <p
              style={{
                margin: "7px 0 0",
                fontSize: "13px",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              구역을 선택하면 해당 섬으로 이동합니다. 섬이 많아 다 안 보이면
              옆으로 드래그해서 넘겨보세요.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontSize: "18px",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* 가로 전체 섬 목록 (1 ~ n), 폭이 부족하면 드래그/스크롤 */}
        <div
          ref={rowRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          style={{
            display: "flex",
            gap: "10px",
            width: "100%",
            overflowX: "auto",
            padding: "20px 4px 16px",
            marginTop: "10px",
            cursor: "grab",
            userSelect: "none",
          }}
        >
          {islands.map((island, index) => {
            const isCurrent = island.id === currentIsland;

            return (
              <button
                key={island.id}
                onClick={() => handleJump(index)}
                title={`${island.name}으로 이동`}
                style={{
                  flex: "0 0 auto",
                  minWidth: "92px",
                  padding: "16px 12px",
                  borderRadius: "16px",
                  border: isCurrent
                    ? "2px solid rgba(196,181,253,0.9)"
                    : "1px solid rgba(165,180,252,0.25)",
                  background: isCurrent
                    ? "linear-gradient(135deg, #6366f1, #4338ca)"
                    : "rgba(255,255,255,0.05)",
                  boxShadow: isCurrent
                    ? "0 0 15px rgba(129,140,248,0.5)"
                    : "none",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: isCurrent ? "#e0e7ff" : "rgba(255,255,255,0.5)",
                    fontWeight: "bold",
                  }}
                >
                  {index + 1}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    maxWidth: "110px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {island.name}
                </span>
              </button>
            );
          })}

          {islands.length === 0 && (
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.5)",
                padding: "10px 4px",
              }}
            >
              아직 개척한 섬이 없습니다. 아래 버튼으로 첫 섬을 만들어보세요.
            </div>
          )}
        </div>

        {/* 섬 삭제 / 섬 생성 */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "8px",
          }}
        >
          <button
            onClick={() => currentIsland && onDeleteIsland(currentIsland)}
            disabled={!currentIsland}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.1)",
              color: "#f87171",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: currentIsland ? "pointer" : "not-allowed",
              opacity: currentIsland ? 1 : 0.5,
            }}
          >
            🗑️ 현재 섬 삭제
          </button>

          <button
            onClick={onOpenAddIsland}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #a5b4fc)",
              border: "none",
              color: "#0f172a",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ✨ 새로운 섬 개척하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default MapModal;
