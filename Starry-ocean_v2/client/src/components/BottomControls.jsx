// client/src/components/BottomControls.jsx

import React from "react";
import "../components_css/BottomControls.css";

// 하단 메모 입력 및 AI 자동배치
function BottomControls({
  loadingAI,
  onAutoArrange,
  content,
  onChangeContent,
  onSubmit,
  islandName,
}) {
  return (
    <div className="bottom-controls">
      {/* AI 메모 자동배치 */}
      <button className="ai-constellation-btn" onClick={onAutoArrange}>
        🌌 별들 자동배치 (재정렬)
      </button>

      {/* 메모 입력 및 등록 */}
      <form onSubmit={onSubmit} className="space-memo-box">
        <textarea
          value={content}
          onChange={(e) => onChangeContent(e.target.value)}
          placeholder={`${islandName}에 기록할 이야기를 적어주세요... (AI가 분석합니다)`}
        />

        {/* AI 분석 중에는 등록 버튼 비활성화 */}
        <button type="submit" disabled={loadingAI}>
          {loadingAI ? "AI 분석 및 기록 중..." : "별 띄우기 ✨"}
        </button>
      </form>
    </div>
  );
}

export default BottomControls;
