// client/src/hooks/useIslandsAndMemos.js
//
// 기존 App.jsx의 fetchAllData / fetchMemos 로직을 훅으로 분리했습니다.
// fetchAllIslandMemos는 fetchAllData와 내용이 거의 동일한 미사용 중복 함수라 제거했습니다.

import { useState, useCallback, useEffect } from "react";
import * as api from "../api/client";
import {
  resolveAbsoluteCoords,
  resolveCoords,
  resolveStarColor,
} from "../utils/starPosition";

export function useIslandsAndMemos() {
  const [islands, setIslands] = useState([]);
  const [currentIsland, setCurrentIsland] = useState(1);
  const [memos, setMemos] = useState([]);
  const [allMemos, setAllMemos] = useState([]);

  // 1. 모든 섬 + 전체 메모를 한 번에 불러오기
  const fetchAllData = useCallback(async () => {
    try {
      const [islandRes, memoRes] = await Promise.all([
        api.fetchIslands(),
        api.fetchAllMemos(),
      ]);

      // 섬 데이터 처리 (안전하게 방어 코드 추가)
      const islandsData = islandRes.data.success
        ? islandRes.data.data
        : islandRes.data;
      if (Array.isArray(islandsData)) {
        setIslands(islandsData);
      }

      // 메모 데이터 처리 (success가 있든 없든 배열이면 무조건 반영!)
      const memosData = memoRes.data.success
        ? memoRes.data.data
        : Array.isArray(memoRes.data)
          ? memoRes.data
          : memoRes.data.data;

      if (Array.isArray(memosData)) {
        const processedAllMemos = memosData.map((memo) => {
          const { x, y } = resolveCoords(memo);
          const { starColor, glowColor } = resolveStarColor(memo.created_at);

          return {
            ...memo,
            x,
            y,
            size: memo.size != null ? Number(memo.size) : 14,
            starColor,
            glowColor,
          };
        });

        setAllMemos(processedAllMemos);
        setMemos(processedAllMemos);
      }
    } catch (err) {
      console.error("데이터 로딩 에러:", err);
    }
  }, []);

  // 2. 특정 섬의 메모만 불러오거나, 혹은 전체 메모 중에서 현재 섬에 맞는 것을 필터링
  // 만약 서버에서 섬별로 따로 가져와야 한다면 아래처럼 전체 리스트에 합쳐주거나 유지해야 합니다.
  const fetchMemos = useCallback(async (islandId) => {
    try {
      const response = await api.fetchMemosByIsland(islandId);
      if (response.data.success && Array.isArray(response.data.data)) {
        const memosWithPosition = response.data.data.map((memo) => {
          const { x, y } = resolveCoords(memo);
          const { starColor, glowColor } = resolveStarColor(memo.created_at);

          return {
            ...memo,
            x,
            y,
            size: memo.size != null ? Number(memo.size) : 14,
            starColor,
            glowColor,
          };
        });

        // 💡 핵심: 기존 전체 메모(allMemos)에서 방금 가져온 섬의 메모들만 업데이트해주거나,
        // 혹은 StarField에 항상 `allMemos`를 넘겨주도록 처리합니다.
        setAllMemos((prev) => {
          const filtered = prev.filter((m) => m.island_id !== islandId);
          return [...filtered, ...memosWithPosition];
        });
      }
    } catch (err) {
      console.error("메모 로딩 에러:", err);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  // 💡 [변경] 섬이 바뀔 때 memos를 덮어씌우는 대신, StarField가 전체 은하계(`allMemos`)를 바라보게 합니다.
  // 만약 특정 섬만 보게 하고 싶지 않고 전체를 다 보게 하려면 memos 대신 allMemos를 리턴해주면 됩니다!

  return {
    islands,
    currentIsland,
    setCurrentIsland,
    memos,
    allMemos, // 👈 핵심: 항상 전체 은하계의 모든 별들이 렌더링되도록 allMemos를 memos로 리턴!
    setMemos,
    fetchAllData,
    fetchMemos,
  };
}
