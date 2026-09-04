// client/src/components/MapModal.jsx

import React from "react";
import { useDragScroll } from "../hooks/useDragScroll";
import "../components_css/MapModal.css";

// 전체 섬 지도를 보여주는 모달
function MapModal({
  isOpen,
  islands = [],
  currentIsland,
  onClose,
  onJumpToIsland,
  onOpenAddIsland,
  onDeleteIsland,
}) {
  // 가로 드래그 스크롤
  const {
    fieldRef: rowRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
  } = useDragScroll();

  if (!isOpen) return null;

  // 선택한 섬으로 이동
  const handleJump = (index) => {
    onJumpToIsland(index);
  };

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="map-modal-header">
          <div>
            <h2 className="map-modal-title">🧭 스타리 오션 전체 지도</h2>

            <p className="map-modal-description">
              구역을 선택하면 해당 섬으로 이동합니다. 섬이 많아 다 안 보이면
              옆으로 드래그해서 넘겨보세요.
            </p>
          </div>

          <button className="map-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 섬 목록 */}
        <div
          ref={rowRef}
          className="island-list"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {islands.map((island, index) => {
            const isCurrent = island.id === currentIsland;

            return (
              <button
                key={island.id}
                className={`island-button ${isCurrent ? "current" : ""}`}
                onClick={() => handleJump(index)}
                title={`${island.name}으로 이동`}
              >
                <span className="island-number">{index + 1}</span>
                <span className="island-name">{island.name}</span>
              </button>
            );
          })}

          {islands.length === 0 && (
            <div className="empty-island-message">
              아직 개척한 섬이 없습니다. 아래 버튼으로 첫 섬을 만들어보세요.
            </div>
          )}
        </div>

        {/* 섬 관리 버튼 */}
        <div className="map-modal-actions">
          <button
            className="delete-island-button"
            onClick={() => currentIsland && onDeleteIsland(currentIsland)}
            disabled={!currentIsland}
          >
            🗑️ 현재 섬 삭제
          </button>

          <button className="add-island-button" onClick={onOpenAddIsland}>
            ✨ 새로운 섬 개척하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default MapModal;
