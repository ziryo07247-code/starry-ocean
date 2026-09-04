const express = require("express");

const router = express.Router();

const {
  getMemosByIsland,
  getAllMemos,
  createMemo,
  deleteMemo,
  moveMemo,
} = require("../controllers/memoController");

// 전체 메모 조회
// "/all"은 "/:id"보다 먼저 선언해야 함
router.get("/all", getAllMemos);

// 특정 섬의 메모 조회
router.get("/", getMemosByIsland);

// 메모 생성
router.post("/", createMemo);

// 메모 삭제
router.delete("/:id", deleteMemo);

// 메모를 다른 섬으로 이동
router.put("/:id/move", moveMemo);

module.exports = router;
