// server/controllers/aiMemoController.js
//
// AI 관련 메모 기능 (임베딩 생성, 유사도 비교, 자동 배치)을 모아둔 컨트롤러.
// 기존 ai-agent/memoController.js + ai-agent/autoLayoutController.js 를 통합했습니다.

const db = require("../config/db");
const {
  createEmbedding,
  calculateCosineSimilarity,
} = require("../services/embeddingService");

const SIMILARITY_THRESHOLD_CREATE = 0.7; // 새 메모 생성 시 "연관 메모"로 인정하는 기준
const SIMILARITY_THRESHOLD_LAYOUT = 0.75; // 자동 배치 시 같은 그룹으로 묶는 기준

/**
 * AI 자동 분석 메모 생성
 * POST /api/ai/memos
 *
 * 참고: connectedMemoId / similarityScore 는 응답에 내려주지만
 * 현재 프론트엔드는 이 값을 아직 사용하고 있지 않습니다.
 */
async function createAIMemo(req, res) {
  try {
    const { content, island_id } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        error: "메모 내용은 필수입니다.",
      });
    }

    // 1. 새 메모 임베딩 생성
    const newEmbedding = await createEmbedding(content);

    // 2. 현재 섬의 기존 메모 가져오기
    const [existingMemos] = await db.query(
      "SELECT id, content, x_coord, y_coord, embedding FROM memos WHERE island_id = ?",
      [island_id],
    );

    let connectedMemoId = null;
    let maxSimilarity = 0;

    // 3. 기존 메모와 유사도 비교
    for (const memo of existingMemos) {
      if (!memo.embedding) continue;

      let existingEmbedding;
      try {
        existingEmbedding =
          typeof memo.embedding === "string"
            ? JSON.parse(memo.embedding)
            : memo.embedding;
      } catch (parseError) {
        console.log(`메모 ID ${memo.id}의 embedding 파싱 실패`);
        continue;
      }

      const similarity = calculateCosineSimilarity(
        newEmbedding,
        existingEmbedding,
      );

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        if (similarity >= SIMILARITY_THRESHOLD_CREATE) {
          connectedMemoId = memo.id;
        }
      }
    }

    // 4. 새 메모 위치 생성 (최초 1회만 랜덤 배치, 이후 auto-layout으로 재배치 가능)
    const x_coord = Math.random() * 2200 + 100;
    const y_coord = Math.random() * 65 + 10;

    if (connectedMemoId) {
      console.log(
        `연관된 메모(ID: ${connectedMemoId}) 발견! 유사도: ${maxSimilarity.toFixed(2)}`,
      );
    }

    // 5. DB에 실제 메모 저장
    const [result] = await db.query(
      `INSERT INTO memos (content, island_id, x_coord, y_coord, embedding)
       VALUES (?, ?, ?, ?, ?)`,
      [content, island_id, x_coord, y_coord, JSON.stringify(newEmbedding)],
    );

    return res.status(201).json({
      message: "AI 분석 기반 메모가 성공적으로 생성되었습니다.",
      data: {
        id: result.insertId,
        island_id,
        content,
        x_coord,
        y_coord,
        connectedMemoId,
        similarityScore: maxSimilarity,
      },
    });
  } catch (error) {
    console.error("AI 메모 생성 중 오류 발생:", error);
    return res.status(500).json({
      error: "서버 내부 오류가 발생했습니다.",
      detail: error.message,
    });
  }
}

/**
 * AI 자동 별자리 배치
 * POST /api/ai/memos/auto-layout
 *
 * 현재 섬의 모든 메모를 다시 분석하여
 * 1. 모든 메모 쌍의 유사도 계산
 * 2. 유사한 메모끼리 연결
 * 3. 연결 관계를 기반으로 그룹 생성
 * 4. 그룹별 위치 재배치
 *
 * AI 재배치 버튼을 누를 때마다 전체 별자리를 새롭게 구축한다.
 */
async function autoLayoutMemos(req, res) {
  try {
    const { island_id } = req.body;

    if (!island_id) {
      return res.status(400).json({
        success: false,
        error: "island_id가 필요합니다.",
      });
    }

    // ============================================================
    // 1. 현재 섬의 모든 메모 가져오기
    // ============================================================

    const [memos] = await db.query(
      `SELECT id, content, x_coord, y_coord, embedding
       FROM memos
       WHERE island_id = ?
       ORDER BY id ASC`,
      [island_id],
    );

    if (memos.length === 0) {
      return res.status(200).json({
        success: true,
        message: "배치할 메모가 없습니다.",
        data: {
          groupCount: 0,
          memoCount: 0,
          layouts: [],
          connections: [],
        },
      });
    }

    // ============================================================
    // 2. embedding 파싱
    // ============================================================

    const memoData = memos
      .filter((memo) => memo.embedding)
      .map((memo) => {
        try {
          const embedding =
            typeof memo.embedding === "string"
              ? JSON.parse(memo.embedding)
              : memo.embedding;

          return {
            ...memo,
            embedding,
          };
        } catch (error) {
          console.log(`⚠️ 메모 ${memo.id} embedding 파싱 실패`);

          return null;
        }
      })
      .filter(Boolean);

    if (memoData.length === 0) {
      return res.status(400).json({
        success: false,
        error: "AI 분석에 사용할 embedding이 있는 메모가 없습니다.",
      });
    }

    // ============================================================
    // 3. 모든 메모 쌍의 유사도 계산
    // ============================================================

    const connections = [];

    for (let i = 0; i < memoData.length; i++) {
      for (let j = i + 1; j < memoData.length; j++) {
        const a = memoData[i];
        const b = memoData[j];

        const similarity = calculateCosineSimilarity(a.embedding, b.embedding);

        console.log(`🔗 메모 ${a.id} ↔ ${b.id} : ${similarity.toFixed(3)}`);

        if (similarity >= SIMILARITY_THRESHOLD_LAYOUT) {
          connections.push({
            fromId: a.id,
            toId: b.id,
            similarity,
          });
        }
      }
    }

    // ============================================================
    // 4. 연결 관계를 기반으로 그룹 생성
    //
    // 예:
    //
    // A-B
    // B-C
    // C-D
    //
    // → 하나의 그룹
    //
    // A-B
    // C-D
    //
    // → 두 개의 그룹
    // ============================================================

    const adjacency = new Map();

    memoData.forEach((memo) => {
      adjacency.set(memo.id, []);
    });

    connections.forEach((connection) => {
      adjacency.get(connection.fromId)?.push(connection.toId);
      adjacency.get(connection.toId)?.push(connection.fromId);
    });

    const visited = new Set();
    const groups = [];

    for (const memo of memoData) {
      if (visited.has(memo.id)) continue;

      const group = [];
      const queue = [memo.id];

      visited.add(memo.id);

      while (queue.length > 0) {
        const currentId = queue.shift();

        const currentMemo = memoData.find((m) => m.id === currentId);

        if (currentMemo) {
          group.push(currentMemo);
        }

        const neighbors = adjacency.get(currentId) || [];

        for (const neighborId of neighbors) {
          if (visited.has(neighborId)) continue;

          visited.add(neighborId);
          queue.push(neighborId);
        }
      }

      groups.push(group);
    }

    // ============================================================
    // 5. 그룹별 공간 배치
    // ============================================================

    const AREA_WIDTH = 2200;
    const AREA_HEIGHT = 1500;

    // 메모 사이의 거리
    const MEMO_RADIUS = 180;

    const updatedMemos = [];

    // 그룹 순서를 랜덤하게 섞어서
    // 버튼을 누를 때마다 조금씩 다른 별자리 생성
    const shuffledGroups = [...groups].sort(() => Math.random() - 0.5);

    const cols = Math.max(1, Math.ceil(Math.sqrt(shuffledGroups.length)));

    const rows = Math.max(1, Math.ceil(shuffledGroups.length / cols));

    const cellWidth = AREA_WIDTH / cols;
    const cellHeight = AREA_HEIGHT / rows;

    shuffledGroups.forEach((group, groupIndex) => {
      const col = groupIndex % cols;
      const row = Math.floor(groupIndex / cols);

      // 그룹 중심 위치
      const centerX =
        col * cellWidth +
        cellWidth / 2 +
        (Math.random() - 0.5) * cellWidth * 0.35;

      const centerY =
        row * cellHeight +
        cellHeight / 2 +
        (Math.random() - 0.5) * cellHeight * 0.35;

      // ==========================================================
      // 그룹 크기에 따라 별 배치
      // ==========================================================

      group.forEach((memo, memoIndex) => {
        let x;
        let y;

        if (group.length === 1) {
          // 혼자 있는 메모
          x = centerX;
          y = centerY;
        } else {
          // 원형으로 배치
          const angle = (memoIndex / group.length) * Math.PI * 2;

          // 그룹이 커질수록 조금 넓게
          const radius = MEMO_RADIUS + Math.min(group.length * 15, 100);

          x = centerX + Math.cos(angle) * radius;

          y = centerY + Math.sin(angle) * radius;
        }

        // 영역 밖으로 나가지 않도록 제한
        x = Math.max(100, Math.min(AREA_WIDTH - 100, x));

        y = Math.max(100, Math.min(AREA_HEIGHT - 100, y));

        updatedMemos.push({
          id: memo.id,
          x_coord: x,
          y_coord: y,
          groupIndex,
        });
      });
    });

    // ============================================================
    // 6. DB에 새로운 좌표 저장
    // ============================================================

    for (const memo of updatedMemos) {
      await db.query(
        `UPDATE memos
         SET x_coord = ?, y_coord = ?
         WHERE id = ?`,
        [memo.x_coord, memo.y_coord, memo.id],
      );
    }

    // ============================================================
    // 7. 결과 반환
    //
    // 프론트에서 기존 connections를 새 connections로 교체한다.
    // ============================================================

    return res.status(200).json({
      success: true,

      message:
        "AI가 현재 섬의 모든 메모를 다시 분석하여 별자리를 재구축했습니다.",

      data: {
        groupCount: groups.length,

        memoCount: updatedMemos.length,

        layouts: updatedMemos,

        connections: connections,
      },
    });
  } catch (error) {
    console.error("❌ AI 자동 별자리 재구축 오류:", error);

    return res.status(500).json({
      success: false,

      error: "AI 자동 별자리 재구축 중 서버 오류가 발생했습니다.",

      detail: error.message,
    });
  }
}

module.exports = {
  createAIMemo,
  autoLayoutMemos,
};
