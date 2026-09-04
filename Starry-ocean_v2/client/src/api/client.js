// client/src/api/client.js

import axios from "axios";

// API 기본 주소
const BASE_URL = "http://localhost:3000/api";

const client = axios.create({
  baseURL: BASE_URL,
});

// 섬 API
export const fetchIslands = () => client.get("/islands");
export const createIsland = (payload) => client.post("/islands", payload);
export const deleteIsland = (islandId) => client.delete(`/islands/${islandId}`);

// 메모 API
export const fetchAllMemos = () => client.get("/memos/all");
export const fetchMemosByIsland = (islandId) =>
  client.get("/memos", {
    params: { island: islandId },
  });
export const createMemo = (payload) => client.post("/memos", payload);
export const deleteMemo = (memoId) => client.delete(`/memos/${memoId}`);

// AI 메모 API
export const createAIMemo = (payload) => client.post("/ai/memos", payload);
export const autoLayoutMemos = (islandId) =>
  client.post("/ai/memos/auto-layout", {
    island_id: islandId,
  });

// 메모 이동 API
export const moveMemo = (memoId, islandId) =>
  client.put(`/memos/${memoId}/move`, {
    island_id: islandId,
  });

export default client;
