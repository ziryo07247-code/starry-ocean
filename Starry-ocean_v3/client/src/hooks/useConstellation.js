// client/src/hooks/useConstellation.js
//
// 기존 App.jsx의 handleConnectAI 로직을 훅으로 분리했습니다.
//
// 참고: 이건 클라이언트 쪽 키워드 매칭이고, 서버에는 임베딩 유사도 기반의
// 진짜 AI 배치 로직(POST /api/ai/memos/auto-layout)이 이미 구현되어 있지만
// 아직 여기 연결되어 있지 않습니다. 실제 "AI 텍스트 유사도 분석"을 셀링포인트로
// 쓰려면 이 훅을 그 엔드포인트를 호출하는 방식으로 교체하는 게 다음 단계로 좋습니다.

import { useState } from "react";

const STOP_WORDS = new Set([
  "은", "는", "이", "가", "을", "를", "에", "의", "도",
  "하고", "그리고", "있어", "했어", "것", "수",
]);

const CONSTELLATION_NAMES = [
  "공통의 기억이 빚어낸 별자리 ✨",
  "감정의 결이 닿은 오로라 궤적 🌌",
  "심해 속 깊은 연관성의 네트워크 💫",
  "영감과 주제가 통하는 은하계 🚀",
];

function extractKeywords(content) {
  return content
    .replace(/[^\w\s가-힣]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

export function useConstellation() {
  const [isConstellationActive, setIsConstellationActive] = useState(false);
  const [constellationData, setConstellationData] = useState({
    name: "",
    connections: [],
  });

  const connectByKeywords = (memos, currentIsland) => {
    if (memos.length < 2) {
      alert("별자리를 이으려면 최소 2개 이상의 별(메모)이 필요합니다! ✨");
      return;
    }

    const memoData = memos.map((m) => ({
      id: m.id,
      words: new Set(extractKeywords(m.content)),
    }));

    const connections = [];
    const connectedPairs = new Set();

    for (let i = 0; i < memoData.length; i++) {
      for (let j = i + 1; j < memoData.length; j++) {
        const a = memoData[i];
        const b = memoData[j];
        const commonWords = [...a.words].filter((w) => b.words.has(w));

        if (commonWords.length > 0) {
          const pairKey = `${Math.min(a.id, b.id)}-${Math.max(a.id, b.id)}`;
          if (!connectedPairs.has(pairKey)) {
            connectedPairs.add(pairKey);
            connections.push({
              sourceId: a.id,
              targetId: b.id,
              reason: `'${commonWords.join(", ")}' 관련 공통 주제 발견`,
            });
          }
        }
      }
    }

    if (connections.length === 0) {
      alert(
        "AI 분석 결과: 현재 작성된 메모들 사이에는 뚜렷한 공통 주제가 없어 연결할 수 없습니다. 비슷한 주제의 메모를 더 적어보세요! ✨",
      );
      setIsConstellationActive(false);
      return;
    }

    setConstellationData({
      name: CONSTELLATION_NAMES[(currentIsland - 1) % CONSTELLATION_NAMES.length],
      connections,
    });
    setIsConstellationActive(true);
  };

  return {
    isConstellationActive,
    setIsConstellationActive,
    constellationData,
    connectByKeywords,
  };
}
