import React, { useState, useEffect } from "react";

export default function ConstellationCanvas({
  memos = [],
  connections = [],
  onSelectMemo,
  onUpdateMemoPosition,
  totalWidth = 2400,
}) {
  const [hoveredMemoId, setHoveredMemoId] = useState(null);
  const [draggingMemoId, setDraggingMemoId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasHeight = Math.max(
    800,
    ...memos.map((memo) => {
      const y = Number(memo.y ?? memo.pos_y ?? 300);
      return y + 150;
    }),
  );

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

  // 🖱️ 별 드래그 시작
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

  // 🖱️ 전역 마우스 이동 및 종료 이벤트 처리
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
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: `${totalWidth}px`,
        height: `${canvasHeight}px`,
        pointerEvents: "none",
        zIndex: 10,
        overflow: "visible",
      }}
    >
      {/* 1. SVG 선 영역 */}
      <svg
        style={{
          width: `${totalWidth}px`,
          height: `${canvasHeight}px`,
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          overflow: "visible",
        }}
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

      {/* 2. ⭐ 별 영역 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${totalWidth}px`,
          height: `${canvasHeight}px`,
          pointerEvents: "auto", // 👈 별 영역은 클릭 가능하도록 복구
          zIndex: 999,
          overflow: "visible",
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
              className="memo-star"
              style={{
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
                width: `${size}px`,
                height: `${size}px`,
                cursor: draggingMemoId === memo.id ? "grabbing" : "grab",
                pointerEvents: "auto",
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
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: starColor,
                  borderRadius: "50%",
                  boxShadow: isHovered
                    ? `0 0 15px ${starColor}, 0 0 25px rgba(255, 255, 255, 0.9)`
                    : `0 0 10px ${starColor}`,
                  transform: isHovered ? "scale(1.3)" : "scale(1)",
                  transition: "transform 0.2s ease-in-out",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "50%",
                  transform: `translateX(-50%) ${
                    isHovered ? "translateY(0)" : "translateY(-4px)"
                  }`,
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#ffffff",
                  backgroundColor: "rgba(15, 23, 42, 0.85)",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  zIndex: 1000,
                }}
              >
                {memo.title || memo.name || "무명의 별"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
