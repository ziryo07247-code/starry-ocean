const express = require("express");

const router = express.Router();

const {
  getAllIslands,
  createIsland,
  deleteIsland,
} = require("../controllers/islandController");

// 전체 섬 조회
router.get("/", getAllIslands);

// 새로운 섬 생성
router.post("/", createIsland);

// 섬 삭제
router.delete("/:id", deleteIsland);

module.exports = router;
