// client/src/hooks/useIslandScrollSync.js
//
// 기존 App.jsx의 handleScroll 로직(스크롤 위치 -> 현재 섬 감지, 섬 진입 타이틀 페이드)을 분리했습니다.

import { useState } from "react";
import { ISLAND_WIDTH_PX } from "../utils/starPosition";

export function useIslandScrollSync(fieldRef, islands, setCurrentIsland) {
  const [isTextVisible, setIsTextVisible] = useState(true);
  const [lastIslandId, setLastIslandId] = useState(null);

  const handleScroll = () => {
    const field = fieldRef.current;
    if (!field || islands.length === 0) return;

    const scrollLeft = field.scrollLeft;
    const currentIndex = Math.floor((scrollLeft + ISLAND_WIDTH_PX / 2) / ISLAND_WIDTH_PX);
    const island = islands[currentIndex];

    if (island) {
      setCurrentIsland(island.id);

      if (lastIslandId !== island.id) {
        setIsTextVisible(true);
        setLastIslandId(island.id);

        setTimeout(() => {
          setIsTextVisible(false);
        }, 2500);
      }
    }
  };

  return { isTextVisible, handleScroll };
}
