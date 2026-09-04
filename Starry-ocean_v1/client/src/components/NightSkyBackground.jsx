import React, { useEffect, useRef } from "react";
import { ISLAND_WIDTH_PX } from "../utils/starPosition";

// 섬 순서(인덱스)에 따라 순환하는 배경 팔레트.
// currentIsland의 DB id가 아니라 "몇 번째 섬인지"로 고르기 때문에
// 섬이 삭제/생성되어 id가 뒤죽박죽이어도, 그리고 섬이 4개보다 많아져도
// (무제한 섬 확장) 자연스럽게 순환됩니다.
const THEME_PALETTE = [
  { bg: ["#0b1026", "#141b32", "#1a2238"], star: [255, 255, 255] }, // 고요한 밤바다
  { bg: ["#0f0c29", "#302b63", "#24243e"], star: [150, 220, 255] }, // 오로라
  { bg: ["#050505", "#120428", "#1a0033"], star: [255, 180, 220] }, // 심해 클러스터
  { bg: ["#020005", "#0a0015", "#15002b"], star: [200, 200, 255] }, // 은하계 체인
];

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    parseInt(value.substring(0, 2), 16),
    parseInt(value.substring(2, 4), 16),
    parseInt(value.substring(4, 6), 16),
  ];
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpRgb(rgbA, rgbB, t) {
  return [
    Math.round(lerp(rgbA[0], rgbB[0], t)),
    Math.round(lerp(rgbA[1], rgbB[1], t)),
    Math.round(lerp(rgbA[2], rgbB[2], t)),
  ];
}

function rgbToCss([r, g, b], alpha = 1) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function NightSkyBackground({ islands = [], fieldRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // 별 생성
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
    }));

    // 유성(Shooting Star)
    let shootingStars = [];
    const createShootingStar = () => {
      if (Math.random() < 0.025) {
        shootingStars.push({
          x: Math.random() * width,
          y: -100 - Math.random() * 200,

          length: Math.random() * 60 + 50,
          speed: Math.random() * 4 + 5,

          // ↘
          dx: 0.45,
          dy: 0.9,

          opacity: Math.random() * 0.4 + 0.6,
        });
      }
    };

    // 현재 스크롤 위치 기준으로, 지나온 섬 테마 <-> 다음 섬 테마를 실시간으로 보간
    const getBlendedTheme = () => {
      const islandCount = Math.max(islands.length, 1);
      const scrollLeft = fieldRef?.current?.scrollLeft || 0;

      const rawIndex = scrollLeft / ISLAND_WIDTH_PX;
      const clampedIndex = Math.min(
        Math.max(rawIndex, 0),
        islandCount - 1 >= 0 ? islandCount - 1 : 0,
      );

      const fromIndex = Math.floor(clampedIndex);
      const toIndex = Math.min(fromIndex + 1, islandCount - 1);
      const t = clampedIndex - fromIndex;

      const themeFrom = THEME_PALETTE[fromIndex % THEME_PALETTE.length];
      const themeTo = THEME_PALETTE[toIndex % THEME_PALETTE.length];

      const bg = themeFrom.bg.map((color, i) =>
        rgbToCss(lerpRgb(hexToRgb(color), hexToRgb(themeTo.bg[i]), t)),
      );
      const starRgb = lerpRgb(themeFrom.star, themeTo.star, t);

      return { bg, starRgb };
    };

    // 렌더링 루프
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. 스크롤 위치에 맞게 이어지는 그라데이션 배경
      const { bg, starRgb } = getBlendedTheme();
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, bg[0]);
      gradient.addColorStop(0.5, bg[1]);
      gradient.addColorStop(1, bg[2]);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. 반짝이는 별
      stars.forEach((star) => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = rgbToCss(starRgb, 0.9);
        ctx.globalAlpha = Math.abs(star.alpha);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 3. 유성우
      createShootingStar();

      shootingStars.forEach((star, index) => {
        ctx.beginPath();

        ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";

        // 유성 꼬리
        ctx.moveTo(star.x, star.y);

        ctx.lineTo(
          star.x - star.dx * star.length,
          star.y - star.dy * star.length,
        );

        ctx.stroke();

        // 유성 이동
        star.x += star.dx * star.speed;
        star.y += star.dy * star.speed;

        // 서서히 사라짐
        star.opacity -= 0.01;

        // 화면 밖으로 나가면 제거
        if (
          star.opacity <= 0 ||
          star.y > height + 150 ||
          star.x > width + 150
        ) {
          shootingStars.splice(index, 1);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [islands, fieldRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
