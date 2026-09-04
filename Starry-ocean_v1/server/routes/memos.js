const express = require("express");
const router = express.Router();
const {
  getMemosByIsland,
  getAllMemos,
  createMemo,
  deleteMemo,
  moveMemo,
} = require("../controllers/memoController");

// 주의: "/all"이 "/:id"보다 먼저 와야 합니다 (라우트 순서 중요)
router.get("/all", getAllMemos);
router.get("/", getMemosByIsland);
router.post("/", createMemo);
router.delete("/:id", deleteMemo);
router.put("/:id/move", moveMemo);
module.exports = router;
