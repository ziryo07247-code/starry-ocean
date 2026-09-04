// server/controllers/islandController.js
//
// 기존 server.js 안에 직접 박혀있던 섬(island) CRUD 로직을 분리했습니다.

const db = require("../config/db");

/**
 * [GET] 모든 섬 목록 조회
 */
async function getAllIslands(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM islands ORDER BY id ASC");
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("섬 목록 조회 에러:", err);
    res
      .status(500)
      .json({ success: false, message: "서버 오류가 발생했습니다." });
  }
}

/**
 * [POST] 새로운 섬 무제한 개척(생성)
 */
async function createIsland(req, res) {
  try {
    const { name, subtitle, bg_class } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "섬 이름은 필수입니다." });
    }

    const theme = bg_class || "theme-starlight";
    const [result] = await db.query(
      "INSERT INTO islands (name, subtitle, bg_class) VALUES (?, ?, ?)",
      [name, subtitle || "", theme],
    );

    const [newIsland] = await db.query("SELECT * FROM islands WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      success: true,
      message: "새로운 섬이 성공적으로 개척되었습니다! 🚀",
      data: newIsland[0],
    });
  } catch (err) {
    console.error("섬 생성 에러:", err);
    res
      .status(500)
      .json({ success: false, message: "섬 생성 중 오류가 발생했습니다." });
  }
}

/**
 * [DELETE] 섬 삭제
 *
 * islands.id를 삭제하면
 * memos.island_id의 ON DELETE CASCADE에 의해
 * 해당 섬의 메모도 자동 삭제됩니다.
 */
async function deleteIsland(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "섬 ID가 필요합니다.",
      });
    }

    // 섬 존재 여부 확인
    const [islands] = await db.query("SELECT * FROM islands WHERE id = ?", [
      id,
    ]);

    if (islands.length === 0) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 섬입니다.",
      });
    }

    // 섬 삭제
    // memos 테이블의 ON DELETE CASCADE 때문에
    // 해당 섬에 속한 메모도 자동으로 삭제됨
    await db.query("DELETE FROM islands WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "섬과 해당 섬의 모든 메모가 삭제되었습니다.",
      data: {
        deletedIslandId: Number(id),
      },
    });
  } catch (err) {
    console.error("섬 삭제 에러:", err);

    res.status(500).json({
      success: false,
      message: "섬 삭제 중 오류가 발생했습니다.",
    });
  }
}

module.exports = {
  getAllIslands,
  createIsland,
  deleteIsland,
};
