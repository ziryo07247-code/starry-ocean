const express = require("express");

const router = express.Router();

const {
  createAIMemo,
  autoLayoutMemos,
} = require("../controllers/aiMemoController");

// AI 메모 컨트롤러 연결 확인
console.log("createAIMemo:", typeof createAIMemo);
console.log("autoLayoutMemos:", typeof autoLayoutMemos);

// AI 메모 생성
router.post("/", createAIMemo);

// AI 메모 자동 배치
router.post("/auto-layout", autoLayoutMemos);

module.exports = router;
