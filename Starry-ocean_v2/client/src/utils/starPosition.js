// client/src/utils/starPosition.js
//
// 기존에 fetchAllData / fetchMemos / fetchAllIslandMemos 세 곳에 거의 똑같이
// 복붙되어 있던 좌표 계산 로직을 하나로 통합했습니다.

/**
 * memo.id를 기반으로 한 결정론적(새로고침해도 안 바뀌는) 기본 좌표.
 * DB에 x_coord/y_coord가 없을 때 사용하는 fallback입니다.
 */
export function getDefaultCoords(memoId) {
  const PADDING = 100;
  return {
    x: Math.random() * (ISLAND_WIDTH_PX - PADDING * 2) + PADDING,
    y: Math.random() * (ISLAND_HEIGHT_PX - PADDING * 2) + PADDING,
  };
}

/**
 * DB 좌표가 있으면 그걸 쓰고, 없으면 id 기반 기본 좌표를 씁니다.
 */
export function resolveCoords(memo) {
  const fallback = getDefaultCoords(memo.id);
  return {
    x:
      memo.x_coord != null && Number(memo.x_coord) > 0
        ? Number(memo.x_coord)
        : fallback.x,
    y:
      memo.y_coord != null && Number(memo.y_coord) > 0
        ? Number(memo.y_coord)
        : fallback.y,
  };
}

/**
 * 전체 은하계(여러 섬) 뷰에서 쓰는 절대 좌표.
 * island_id에 따라 가로 오프셋을 더해줍니다.
 */
export function resolveAbsoluteCoords(memo) {
  const { x, y } = resolveCoords(memo);
  const islandOffset = (memo.island_id - 1) * ISLAND_WIDTH_PX;
  return { x: islandOffset + x, y };
}

/**
 * 작성 시각 기준으로 별 색상을 결정합니다.
 * (1시간 이내 / 24시간 이내 / 그 이후)
 */
export function resolveStarColor(createdAt) {
  const diffHours = (new Date() - new Date(createdAt)) / (1000 * 60 * 60);

  if (diffHours < 1) {
    return { starColor: "#fed7aa", glowColor: "#ea580c" };
  }
  if (diffHours < 24) {
    return { starColor: "#fef08a", glowColor: "#facc15" };
  }
  return { starColor: "#e0f2fe", glowColor: "#38bdf8" };
}

export const ISLAND_WIDTH_PX = 2400;
export const ISLAND_HEIGHT_PX = 1350;
