const express = require("express");

const router = express.Router();

const {
  createAIMemo,
  autoLayoutMemos,
} = require("../controllers/aiMemoController");

console.log("createAIMemo:", typeof createAIMemo);
console.log("autoLayoutMemos:", typeof autoLayoutMemos);

router.post("/", createAIMemo);

router.post("/auto-layout", autoLayoutMemos);

module.exports = router;
