const { pipeline } = require("@xenova/transformers");

// 싱글톤 패턴으로 모델을 미리 로드하여 메모리 및 속도 최적화
let extractor = null;

async function getEmbeddingPipeline() {
  if (!extractor) {
    console.log(
      "⏳ [AI] 허깅페이스 모델(Xenova/all-MiniLM-L6-v2) 로딩/다운로드 시작... (최초 1회는 시간이 걸립니다)",
    );
    // 이 줄에서 다운로드 및 로딩이 완료될 때까지 대기합니다.
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("✨ [AI] 모델 로딩 및 준비 완료!");
  }
  return extractor;
}

/**
 * 텍스트를 벡터(임베딩)로 변환
 */
async function createEmbedding(text) {
  try {
    console.log("1. 새 메모 임베딩 벡터 생성 중..");
    const pipe = await getEmbeddingPipeline();

    console.log("2. 텍스트 파이프라인 처리 중..");
    const output = await pipe(text, { pooling: "mean", normalize: true });

    console.log("3. 임베딩 데이터 변환 성공!");
    // Float32Array를 일반 자바스크립트 배열로 변환
    return Array.from(output.data);
  } catch (error) {
    console.error("❌ 무료 임베딩 생성 실패:", error);
    throw error;
  }
}

/**
 * 두 벡터 간의 코사인 유사도 계산 (연관도 측정)
 */
function calculateCosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  createEmbedding,
  calculateCosineSimilarity,
};
