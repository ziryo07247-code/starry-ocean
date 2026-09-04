// client/src/components/ConstellationCanvas.jsx

import React, { useState, useEffect } from "react";
import "../components_css/ConstellationCanvas.css";
import { ISLAND_WIDTH_PX } from "../utils/starPosition";
export default function ConstellationCanvas({
  memos = [],
  connections = [],
  onSelectMemo,
  onUpdateMemoPosition,
  totalWidth = ISLAND_WIDTH_PX * 4,
}) {
  // 메모 hover 및 드래그 상태
  const [hoveredMemoId, setHoveredMemoId] = useState(null);
  const [draggingMemoId, setDraggingMemoId] = useState(null);
  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0,
  });

  // 메모 위치를 기준으로 캔버스 높이 계산
  const canvasHeight = Math.max(
    800,
    ...memos.map((memo) => {
      const y = Number(memo.y ?? memo.pos_y ?? 300);
      return y + 150;
    }),
  );

  // 메모 생성 시간에 따른 별 색상
  const getStarColor = (memo) => {
    const timeValue = memo.created_at || memo.time || memo.date;

    if (!timeValue) return "#ffffff";

    const date = new Date(timeValue);
    const hour = isNaN(date.getHours()) ? 12 : date.getHours();

    if (hour >= 5 && hour < 12) return "#93c5fd";
    if (hour >= 12 && hour < 18) return "#fde047";
    if (hour >= 18 && hour < 22) return "#f472b6";

    return "#c084fc";
  };

  // 메모 연결선 스타일 계산
  const getLineStyle = (similarity = 0.5) => {
    const strokeWidth = Math.max(2, similarity * 5);
    const opacity = Math.max(0.5, similarity);

    return {
      stroke: `rgba(165, 180, 252, ${opacity})`,
      strokeWidth,
      opacity: 1,
      filter:
        similarity > 0.6
          ? "drop-shadow(0 0 6px rgba(165, 180, 252, 0.8))"
          : "none",
    };
  };

  // 별 드래그 시작
  const handleMouseDown = (e, memo) => {
    e.stopPropagation();

    setDraggingMemoId(memo.id);

    const x = memo.x ?? memo.pos_x ?? 200;
    const y = memo.y ?? memo.pos_y ?? 300;

    setDragOffset({
      x: e.clientX - x,
      y: e.clientY - y,
    });
  };

  // 드래그 중 마우스 위치 처리
  useEffect(() => {
    if (!draggingMemoId) return;

    const handleWindowMouseMove = (e) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      if (onUpdateMemoPosition) {
        onUpdateMemoPosition(draggingMemoId, newX, newY, false);
      }
    };

    const handleWindowMouseUp = (e) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      if (onUpdateMemoPosition) {
        onUpdateMemoPosition(draggingMemoId, newX, newY, true);
      }

      setDraggingMemoId(null);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [draggingMemoId, dragOffset, onUpdateMemoPosition]);

  return (
    <div
      className="constellation-canvas"
      style={{
        width: `${totalWidth}px`,
        height: `${canvasHeight}px`,
      }}
    >
      {/* 메모 연결선 */}
      <svg
        className="constellation-lines"
        width={totalWidth}
        height={canvasHeight}
      >
        {connections.map((conn, idx) => {
          const fromMemo = memos.find((m) => m.id === conn.fromId);
          const toMemo = memos.find((m) => m.id === conn.toId);

          if (!fromMemo || !toMemo) return null;

          const x1 = fromMemo.x ?? fromMemo.pos_x ?? 200;
          const y1 = fromMemo.y ?? fromMemo.pos_y ?? 300;
          const x2 = toMemo.x ?? toMemo.pos_x ?? 200;
          const y2 = toMemo.y ?? toMemo.pos_y ?? 300;

          return (
            <line
              key={`line-${idx}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              style={getLineStyle(conn.similarity)}
            />
          );
        })}
      </svg>

      {/* 별 표시 영역 */}
      <div
        className="constellation-stars"
        style={{
          width: `${totalWidth}px`,
          height: `${canvasHeight}px`,
        }}
      >
        {memos.map((memo) => {
          const x = memo.x ?? memo.pos_x ?? 200;
          const y = memo.y ?? memo.pos_y ?? 300;
          const size = 12;
          const isHovered = hoveredMemoId === memo.id;
          const starColor = getStarColor(memo);

          return (
            <div
              key={memo.id}
              className={`memo-star ${
                draggingMemoId === memo.id ? "dragging" : ""
              }`}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                "--star-color": starColor,
                "--star-size": `${size}px`,
              }}
              onMouseEnter={() => setHoveredMemoId(memo.id)}
              onMouseLeave={() => setHoveredMemoId(null)}
              onMouseDown={(e) => handleMouseDown(e, memo)}
              onClick={(e) => {
                e.stopPropagation();

                if (onSelectMemo && !draggingMemoId) {
                  onSelectMemo(memo);
                }
              }}
            >
              <div className={`memo-star-dot ${isHovered ? "hovered" : ""}`} />

              <div className={`memo-star-label ${isHovered ? "visible" : ""}`}>
                {memo.title || memo.name || "무명의 별"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
