// client/src/components/BottomControls.jsx
import React from "react";

function BottomControls({
  isConstellationActive,
  loadingAI,
  onConnectAI,
  onAutoArrange,
  content,
  onChangeContent,
  onSubmit,
  islandName,
}) {
  return (
    <div className="bottom-controls">
      <button
        className="ai-constellation-btn"
        onClick={onAutoArrange}
        style={{ backgroundColor: "#4f46e5", color: "#fff" }}
      >
        🌌 별들 자동배치 (재정렬)
      </button>

      <form onSubmit={onSubmit} className="space-memo-box">
        <textarea
          value={content}
          onChange={(e) => onChangeContent(e.target.value)}
          placeholder={`${islandName}에 기록할 이야기를 적어주세요... (AI가 분석합니다)`}
        />
        <button type="submit" disabled={loadingAI}>
          {loadingAI ? "AI 분석 및 기록 중..." : "별 띄우기 ✨"}
        </button>
      </form>
    </div>
  );
}

export default BottomControls;
