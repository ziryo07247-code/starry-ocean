// client/src/components/StarField.jsx

import React, { useState, useRef, useEffect } from "react";
import ConstellationCanvas from "./ConstellationCanvas";
import { ISLAND_WIDTH_PX, ISLAND_HEIGHT_PX } from "../utils/starPosition";
import "../components_css/StarField.css";

function StarField({
  fieldRef,
  islands = [],
  memos = [],
  connections = [],
  currentIsland,
  isTextVisible,
  onScroll,
  onSelectMemo,
  onUpdateMemoPosition,
}) {
  // 확대 및 드래그 상태
  const [zoom, setZoom] = useState(1);

  const [zoomOrigin, setZoomOrigin] = useState({
    x: ISLAND_WIDTH_PX / 2,
    y: 800,
  });

  const [isDragging, setIsDragging] = useState(false);

  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
  });

  const localFieldRef = fieldRef || useRef(null);

  // 섬 변경 시 확대 상태 초기화
  useEffect(() => {
    setZoom(1);

    setZoomOrigin({
      x: ISLAND_WIDTH_PX / 2,
      y: 800,
    });
  }, [currentIsland]);

  // 현재 섬 정보
  const currentIslandIndex = islands.findIndex(
    (island) => island.id === currentIsland,
  );

  const currentIslandMemos = memos.filter(
    (memo) => memo.island_id === currentIsland,
  );

  const currentIslandMemoIds = new Set(
    currentIslandMemos.map((memo) => memo.id),
  );

  const currentIslandConnections = connections.filter(
    (connection) =>
      currentIslandMemoIds.has(connection.fromId) &&
      currentIslandMemoIds.has(connection.toId),
  );

  // 현재 섬 확대/축소
  useEffect(() => {
    const currentRef = localFieldRef.current;

    if (!currentRef) return;

    const handleWheel = (e) => {
      e.preventDefault();

      if (currentIslandIndex < 0) return;

      const rect = currentRef.getBoundingClientRect();

      const mouseX = e.clientX - rect.left + currentRef.scrollLeft;

      const mouseY = e.clientY - rect.top + currentRef.scrollTop;

      const islandLeft = currentIslandIndex * ISLAND_WIDTH_PX;

      const islandRight = islandLeft + ISLAND_WIDTH_PX;

      if (mouseX < islandLeft || mouseX > islandRight) {
        return;
      }

      const localX = mouseX - islandLeft;
      const localY = mouseY;

      setZoomOrigin({
        x: localX,
        y: localY,
      });

      setZoom((prev) => {
        const next = e.deltaY < 0 ? prev + 0.1 : prev - 0.1;

        return Math.min(Math.max(next, 0.5), 2);
      });
    };

    currentRef.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      currentRef.removeEventListener("wheel", handleWheel);
    };
  }, [currentIslandIndex]);

  // 화면 드래그
  const handleMouseDown = (e) => {
    if (
      e.target.closest(".memo-star") ||
      e.target.closest(".star-memo-container")
    ) {
      return;
    }

    setIsDragging(true);

    const currentRef = localFieldRef.current;

    if (currentRef) {
      setDragStart({
        x: e.clientX + currentRef.scrollLeft,
        y: e.clientY + currentRef.scrollTop,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();

    const currentRef = localFieldRef.current;

    if (!currentRef) return;

    currentRef.scrollLeft = dragStart.x - e.clientX;
    currentRef.scrollTop = dragStart.y - e.clientY;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // 전체 메모 좌표 계산
  const positionedMemos = memos.map((memo) => {
    const islandIndex = islands.findIndex(
      (island) => island.id === memo.island_id,
    );

    const baseOffset = islandIndex >= 0 ? islandIndex * ISLAND_WIDTH_PX : 0;

    return {
      ...memo,
      x: (memo.x !== undefined ? memo.x : memo.pos_x || 200) + baseOffset,
      y: memo.y !== undefined ? memo.y : memo.pos_y || 300,
    };
  });

  return (
    <div
      className="star-field-wrapper"
      ref={localFieldRef}
      onScroll={onScroll}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
    >
      <div
        className="star-field-content"
        style={{
          width: `${islands.length * ISLAND_WIDTH_PX}px`,
        }}
      >
        {islands.map((island, index) => {
          const islandOffset = index * ISLAND_WIDTH_PX;

          const islandMemos = positionedMemos
            .filter((memo) => memo.island_id === island.id)
            .map((memo) => ({
              ...memo,
              x: memo.x - islandOffset,
            }));

          const islandMemoIds = new Set(islandMemos.map((memo) => memo.id));

          const islandConnections = connections.filter(
            (connection) =>
              islandMemoIds.has(connection.fromId) &&
              islandMemoIds.has(connection.toId),
          );

          const isActive = currentIsland === island.id;

          const isCurrent = index === currentIslandIndex;

          return (
            <div
              key={island.id}
              className={`star-island ${isCurrent ? "current" : ""}`}
              style={{
                left: `${islandOffset}px`,
                transform: isCurrent ? `scale(${zoom})` : "scale(1)",
                transformOrigin: `${zoomOrigin.x}px ${zoomOrigin.y}px`,
              }}
            >
              {/* 메모와 연결선 */}
              <ConstellationCanvas
                memos={islandMemos}
                connections={islandConnections}
                onSelectMemo={onSelectMemo}
                onUpdateMemoPosition={onUpdateMemoPosition}
                totalWidth={ISLAND_WIDTH_PX}
              />

              {/* 섬 이름 */}
              <div
                className={`star-island-title ${
                  isActive && isTextVisible ? "visible" : ""
                }`}
              >
                <div className="star-island-name">{island.name}</div>

                <div className="star-island-subtitle">{island.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StarField;
