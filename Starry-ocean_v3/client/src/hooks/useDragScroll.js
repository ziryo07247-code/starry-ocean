// client/src/hooks/useDragScroll.js
//
// 기존 App.jsx의 handleMouseDown/Move/Up 드래그 파노라마 로직을 훅으로 분리했습니다.

import { useState, useRef } from "react";

export function useDragScroll() {
  const fieldRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - fieldRef.current.offsetLeft);
    setScrollLeft(fieldRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - fieldRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    fieldRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return {
    fieldRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
  };
}
