import React, { useState, useRef, useEffect } from "react";
import ConstellationCanvas from "./ConstellationCanvas";
import { ISLAND_WIDTH_PX, ISLAND_HEIGHT_PX } from "../utils/starPosition";

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

  // ✨ 섬이 바뀌면 확대/축소 값을 항상 100%로 리셋한다.
  // (이걸 안 하면, 예를 들어 1호에서 축소해 놓은 zoom 값을 2호가 그대로
  //  물려받아서 2호에 도착하는 순간 별들이 갑자기 커지거나 작아져 보인다.)
  useEffect(() => {
    setZoom(1);
    setZoomOrigin({ x: ISLAND_WIDTH_PX / 2, y: 800 });
  }, [currentIsland]);

  /*
   * 현재 섬 index
   */
  const currentIslandIndex = islands.findIndex(
    (island) => island.id === currentIsland,
  );

  /*
   * 현재 섬에 속한 메모만 추출
   */
  const currentIslandMemos = memos.filter(
    (memo) => memo.island_id === currentIsland,
  );

  /*
   * 현재 섬의 연결선만 추출
   */
  const currentIslandMemoIds = new Set(
    currentIslandMemos.map((memo) => memo.id),
  );

  const currentIslandConnections = connections.filter(
    (connection) =>
      currentIslandMemoIds.has(connection.fromId) &&
      currentIslandMemoIds.has(connection.toId),
  );

  /*
   * 마우스 휠 → 현재 섬만 확대
   */
  useEffect(() => {
    const currentRef = localFieldRef.current;

    if (!currentRef) return;

    const handleWheel = (e) => {
      e.preventDefault();

      if (currentIslandIndex < 0) return;

      const rect = currentRef.getBoundingClientRect();

      // 화면 기준 마우스 위치
      const mouseX = e.clientX - rect.left + currentRef.scrollLeft;

      const mouseY = e.clientY - rect.top + currentRef.scrollTop;

      const islandLeft = currentIslandIndex * ISLAND_WIDTH_PX;

      const islandRight = islandLeft + ISLAND_WIDTH_PX;

      // 현재 섬 바깥에서는 확대/축소하지 않음
      if (mouseX < islandLeft || mouseX > islandRight) {
        return;
      }

      // 현재 섬 내부에서의 마우스 위치
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

  /*
   * 화면 드래그
   */
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

  /*
   * 전체 메모 좌표
   */
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
          minHeight: `${ISLAND_HEIGHT_PX}px`,
          position: "relative",
          overflow: "visible",
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
              style={{
                position: "absolute",
                left: `${islandOffset}px`,
                top: 0,
                width: `${ISLAND_WIDTH_PX}px`,
                height: `${ISLAND_HEIGHT_PX}px`,

                /*
                 * 현재 섬의 확대/축소 영역
                 */
                transform: isCurrent ? `scale(${zoom})` : "scale(1)",

                /*
                 * 확대 중심
                 */
                transformOrigin: `${zoomOrigin.x}px ${zoomOrigin.y}px`,

                transition: "transform 0.25s ease-out",

                overflow: "visible",

                zIndex: isCurrent ? 30 : 20,

                pointerEvents: "none",
              }}
            >
              {/* 현재 섬의 메모 + 연결선 */}
              <ConstellationCanvas
                memos={islandMemos}
                connections={islandConnections}
                onSelectMemo={onSelectMemo}
                onUpdateMemoPosition={onUpdateMemoPosition}
                totalWidth={ISLAND_WIDTH_PX}
              />

              {/* 섬 이름 */}
              <div
                style={{
                  position: "absolute",
                  top: "80px",
                  left: "100px",

                  color: "#ffffff",

                  pointerEvents: "none",

                  opacity: isActive && isTextVisible ? 1 : 0,

                  transition: "opacity 0.8s ease-in-out",

                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    textShadow: "0 0 15px rgba(255,255,255,0.5)",
                    marginBottom: "8px",
                  }}
                >
                  {island.name}
                </div>

                <div
                  style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {island.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StarField;
