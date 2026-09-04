// server/controllers/memoController.js
//
// 일반(비-AI) 메모 CRUD 로직.

const db = require("../config/db");

/**
 * [GET] 특정 무인도의 메모 불러오기
 */
async function getMemosByIsland(req, res) {
  try {
    const islandId = req.query.island || 1;

    const [rows] = await db.query(
      "SELECT * FROM memos WHERE island_id = ? ORDER BY created_at DESC",
      [islandId],
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("메모 조회 에러:", err);
    res
      .status(500)
      .json({ success: false, message: "메모를 불러오는데 실패했습니다." });
  }
}

/**
 * [GET] 전체 섬의 모든 메모 조회 (가로 은하계 렌더링용)
 */
async function getAllMemos(req, res) {
  try {
    const [rows] = await db.query(
      "SELECT * FROM memos ORDER BY created_at ASC",
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("전체 메모 조회 에러:", err);
    res
      .status(500)
      .json({ success: false, message: "서버 오류가 발생했습니다." });
  }
}

/**
 * [POST] 특정 무인도에 새로운 메모 남기기
 */
async function createMemo(req, res) {
  try {
    // 💡 프론트엔드에서 보내는 title 값을 추가로 구조분해 할당합니다.
    const { title, content, island_id } = req.body;
    const targetIsland = island_id || 1;

    if (!content || content.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "메모 내용을 입력해주세요!" });
    }

    // 💡 title이 없을 경우 기본값 처리 ("무명의 별" 또는 빈 문자열)
    const memoTitle = title && title.trim() !== "" ? title.trim() : null;

    // 💡 DB INSERT 쿼리에 title 컬럼 추가
    const [result] = await db.query(
      "INSERT INTO memos (title, content, island_id) VALUES (?, ?, ?)",
      [memoTitle, content, targetIsland],
    );

    res.status(201).json({
      success: true,
      message: "무인도에 별이 안전하게 기록되었습니다! ✨",
      memoId: result.insertId,
    });
  } catch (err) {
    console.error("메모 저장 에러:", err);
    res.status(500).json({
      success: false,
      message: "서버 오류로 메모 저장에 실패했습니다.",
    });
  }
}

/**
 * [DELETE] 메모 삭제
 */
async function deleteMemo(req, res) {
  try {
    const memoId = req.params.id;
    await db.query("DELETE FROM memos WHERE id = ?", [memoId]);
    res.json({ success: true, message: "메모가 삭제되었습니다." });
  } catch (err) {
    console.error("메모 삭제 에러:", err);
    res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
}
/**
 * [PUT] 메모를 다른 섬으로 이동
 */
async function moveMemo(req, res) {
  try {
    const memoId = req.params.id;
    const { island_id } = req.body;

    if (!island_id) {
      return res.status(400).json({
        success: false,
        message: "이동할 섬을 선택해주세요.",
      });
    }

    const [result] = await db.query(
      "UPDATE memos SET island_id = ? WHERE id = ?",
      [island_id, memoId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 메모를 찾을 수 없습니다.",
      });
    }

    res.json({
      success: true,
      message: "메모가 다른 섬으로 이동되었습니다.",
    });
  } catch (err) {
    console.error("메모 이동 에러:", err);

    res.status(500).json({
      success: false,
      message: "서버 오류로 메모 이동에 실패했습니다.",
    });
  }
}
module.exports = {
  getMemosByIsland,
  getAllMemos,
  createMemo,
  deleteMemo,
  moveMemo,
};
