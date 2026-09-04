const mysql = require("mysql2");
require("dotenv").config();

// 데이터베이스 연결 풀(Pool) 생성 - 여러 사용자의 요청을 효율적으로 처리합니다
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD, // .env 파일에 DB_PASSWORD를 반드시 설정하세요
  database: process.env.DB_NAME || "starry_ocean",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 다른 곳에서 DB를 쉽게 가져다 쓸 수 있도록 promise 형태로 내보내기
module.exports = pool.promise();
