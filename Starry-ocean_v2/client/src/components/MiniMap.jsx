import React from "react";
import { ISLAND_WIDTH_PX } from "../utils/starPosition";
import "../components_css/MiniMap.css";

// 현재 위치와 주변 섬을 보여주는 미니맵
function MiniMap({
  islands = [],
  memos = [],
  connections = [],
  currentIsland,
  onOpenMap,
}) {
  const MAP_WIDTH = 280;
  const MAP_HEIGHT = 130;

  // 미니맵에 표시할 섬 개수
  const VISIBLE_SLOTS = 5;

  if (!islands.length) return null;

  const currentIndex = Math.max(
    0,
    islands.findIndex((island) => island.id === currentIsland),
  );

  // 현재 섬을 기준으로 표시할 섬 범위 계산
  let windowStart = currentIndex - Math.floor(VISIBLE_SLOTS / 2);

  windowStart = Math.max(
    0,
    Math.min(windowStart, Math.max(0, islands.length - VISIBLE_SLOTS)),
  );

  const windowEnd = Math.min(islands.length, windowStart + VISIBLE_SLOTS);

  const visibleIslands = islands.slice(windowStart, windowEnd);

  // 섬 영역을 균등하게 분배
  const slotWidth = MAP_WIDTH / visibleIslands.length;

  const hasMoreLeft = windowStart > 0;
  const hasMoreRight = windowEnd < islands.length;

  // 메모의 미니맵 위치 계산
  const getMemoPosition = (memo) => {
    const localIndex = visibleIslands.findIndex(
      (island) => island.id === memo.island_id,
    );

    if (localIndex < 0) return null;

    const relativeX = memo.x !== undefined ? memo.x : memo.pos_x || 200;

    const y = memo.y !== undefined ? memo.y : memo.pos_y || 300;

    return {
      x: localIndex * slotWidth + (relativeX / ISLAND_WIDTH_PX) * slotWidth,
      y: 25 + y * 0.055,
    };
  };

  return (
    <div
      className="mini-map"
      onClick={onOpenMap}
      title="클릭하면 전체 지도를 볼 수 있어요"
    >
      {/* 미니맵 제목 */}
      <div className="mini-map-title">🌌 전체 항해 지도</div>

      {/* 추가 섬 표시 */}
      {hasMoreLeft && (
        <div className="mini-map-arrow mini-map-arrow-left">‹</div>
      )}

      {hasMoreRight && (
        <div className="mini-map-arrow mini-map-arrow-right">›</div>
      )}

      {/* 섬 영역 */}
      {visibleIslands.map((island, localIndex) => {
        const islandLeft = localIndex * slotWidth;
        const isCurrent = island.id === currentIsland;
        const globalIndex = windowStart + localIndex;

        return (
          <div
            key={island.id}
            className={`mini-map-island ${isCurrent ? "current" : ""}`}
            style={{
              left: `${islandLeft}px`,
              width: `${slotWidth}px`,
            }}
          >
            <div className="mini-map-island-number">{globalIndex + 1}</div>

            <div
              className="mini-map-island-name"
              style={{
                maxWidth: `${slotWidth - 4}px`,
              }}
            >
              {island.name}
            </div>
          </div>
        );
      })}

      {/* 메모 연결선 */}
      <svg
        className="mini-map-connections"
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
      >
        {connections.map((connection, index) => {
          const fromMemo = memos.find((memo) => memo.id === connection.fromId);

          const toMemo = memos.find((memo) => memo.id === connection.toId);

          if (!fromMemo || !toMemo) return null;

          const from = getMemoPosition(fromMemo);
          const to = getMemoPosition(toMemo);

          if (!from || !to) return null;

          return (
            <line
              key={index}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className="mini-map-connection-line"
            />
          );
        })}
      </svg>

      {/* 메모 별 */}
      {memos.map((memo) => {
        const position = getMemoPosition(memo);

        if (!position) return null;

        const isMemoIsland = memo.island_id === currentIsland;

        return (
          <div
            key={memo.id}
            className={`mini-map-memo ${isMemoIsland ? "current" : ""}`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          />
        );
      })}
    </div>
  );
}

export default MiniMap;
