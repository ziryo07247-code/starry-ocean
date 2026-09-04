const express = require("express");
const cors = require("cors");
require("dotenv").config();

const islandRouter = require("./routes/islands");
const memoRouter = require("./routes/memos");
const aiMemoRouter = require("./routes/aiMemos");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// 서버 생존 확인용 루트 경로
app.get("/", (req, res) => {
  res.json({
    message: "Starry Ocean 백엔드 서버가 정상 작동 중입니다! 🌊",
  });
});

// 섬 API
app.use("/api/islands", islandRouter);

// 메모 API
app.use("/api/memos", memoRouter);

// AI 메모 API
app.use("/api/ai/memos", aiMemoRouter);

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 멋지게 대기 중입니다.`);
});
