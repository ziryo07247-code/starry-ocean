// client/src/components/AddIslandModal.jsx
import React from "react";

function AddIslandModal({ isOpen, name, subtitle, onChangeName, onChangeSubtitle, onSubmit, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(5, 8, 20, 0.85)",
        backdropFilter: "blur(12px)",
        zIndex: 2500,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "20px",
          padding: "30px",
          width: "400px",
          maxWidth: "90%",
          boxShadow: "0 25px 50px rgba(0,0,0,0.7)",
          color: "#ffffff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", color: "#a5b4fc" }}>✨ 새로운 섬 개척</h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "6px" }}>
              섬 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="예: 5호: 꿈꾸는 안개 숲"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "6px" }}>
              섬 부제 / 설명
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => onChangeSubtitle(e.target.value)}
              placeholder="예: 깊은 상상력이 자라나는 신비로운 공간"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: "10px",
              padding: "12px",
              borderRadius: "8px",
              background: "#6366f1",
              border: "none",
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            개척 완료하기 🚀
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddIslandModal;
