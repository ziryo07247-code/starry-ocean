import React from "react";
import { ISLAND_WIDTH_PX } from "../utils/starPosition";

function MiniMap({ islands = [], memos = [], connections = [], currentIsland, onOpenMap }) {
  const MAP_WIDTH = 280;
  const MAP_HEIGHT = 130;
  // 미니맵 가로 길이는 고정. 섬이 아무리 늘어나도(무제한 확장) 이 개수만큼만
  // 잘라서, 사용자가 지금 보고 있는(currentIsland) 구역을 중심으로 비율을 맞춰 보여준다.
  const VISIBLE_SLOTS = 5;

  if (!islands.length) return null;

  const currentIndex = Math.max(
    0,
    islands.findIndex((island) => island.id === currentIsland),
  );

  // 현재 섬이 가운데 오도록 창(window)을 잡고, 배열 양 끝을 벗어나지 않게 보정
  let windowStart = currentIndex - Math.floor(VISIBLE_SLOTS / 2);
  windowStart = Math.max(
    0,
    Math.min(windowStart, Math.max(0, islands.length - VISIBLE_SLOTS)),
  );
  const windowEnd = Math.min(islands.length, windowStart + VISIBLE_SLOTS);
  const visibleIslands = islands.slice(windowStart, windowEnd);

  // 고정된 MAP_WIDTH를, 지금 보여주는 섬 개수에 맞춰 균등 분배 (= 비율에 맞게 표시)
  const slotWidth = MAP_WIDTH / visibleIslands.length;

  const hasMoreLeft = windowStart > 0;
  const hasMoreRight = windowEnd < islands.length;

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
      onClick={onOpenMap}
      title="클릭하면 전체 지도를 볼 수 있어요"
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: `${MAP_WIDTH}px`,
        height: `${MAP_HEIGHT}px`,
        background: "rgba(5, 8, 25, 0.82)",
        border: "1px solid rgba(165, 180, 252, 0.35)",
        borderRadius: "12px",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
        zIndex: 1500,
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {/* 제목 */}
      <div
        style={{
          position: "absolute",
          top: "7px",
          left: "10px",
          color: "rgba(255,255,255,0.8)",
          fontSize: "10px",
          fontWeight: "bold",
          zIndex: 5,
        }}
      >
        🌌 전체 항해 지도
      </div>

      {/* 창(window) 밖에 섬이 더 있다는 힌트 화살표 */}
      {hasMoreLeft && (
        <div
          style={{
            position: "absolute",
            left: "4px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "rgba(255,255,255,0.5)",
            fontSize: "12px",
            zIndex: 5,
          }}
        >
          ‹
        </div>
      )}
      {hasMoreRight && (
        <div
          style={{
            position: "absolute",
            right: "4px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "rgba(255,255,255,0.5)",
            fontSize: "12px",
            zIndex: 5,
          }}
        >
          ›
        </div>
      )}

      {/* 섬 영역 (현재 보이는 구간만 렌더링) */}
      {visibleIslands.map((island, localIndex) => {
        const islandLeft = localIndex * slotWidth;
        const isCurrent = island.id === currentIsland;
        const globalIndex = windowStart + localIndex;

        return (
          <div
            key={island.id}
            style={{
              position: "absolute",
              left: `${islandLeft}px`,
              top: "25px",
              width: `${slotWidth}px`,
              height: "95px",

              borderRight:
                localIndex < visibleIslands.length - 1
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "none",

              background: isCurrent
                ? "rgba(129, 140, 248, 0.08)"
                : "transparent",
            }}
          >
            {/* 섬 번호 */}
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "9px",
                color: isCurrent ? "#a5b4fc" : "rgba(255,255,255,0.45)",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              {globalIndex + 1}
            </div>

            {/* 섬 이름 */}
            <div
              style={{
                position: "absolute",
                top: "14px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "7px",
                color: "rgba(255,255,255,0.45)",
                whiteSpace: "nowrap",
                maxWidth: `${slotWidth - 4}px`,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {island.name}
            </div>
          </div>
        );
      })}

      {/* 연결선 */}
      <svg
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
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
              stroke="rgba(165,180,252,0.45)"
              strokeWidth="1"
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
            style={{
              position: "absolute",
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: "4px",
              height: "4px",
              borderRadius: "50%",

              background: isMemoIsland ? "#ffffff" : "rgba(165,180,252,0.8)",

              boxShadow: isMemoIsland
                ? "0 0 6px rgba(255,255,255,0.9)"
                : "0 0 3px rgba(165,180,252,0.6)",

              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        );
      })}
    </div>
  );
}

export default MiniMap;
