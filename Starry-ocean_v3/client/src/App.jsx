// client/src/App.jsx

import React, { useState, useMemo, useRef } from "react";
import * as api from "./api/client";

import NightSkyBackground from "./components/NightSkyBackground";
import MapModal from "./components/MapModal";
import AddIslandModal from "./components/AddIslandModal";
import MemoModal from "./components/MemoModal";
import StarField from "./components/StarField";
import BottomControls from "./components/BottomControls";
import TitleModal from "./components/TitleModal";
import MiniMap from "./components/MiniMap";

import { useIslandsAndMemos } from "./hooks/useIslandsAndMemos";
import { useConstellation } from "./hooks/useConstellation";
import { useIslandScrollSync } from "./hooks/useIslandScrollSync";

import "./App.css";

// 전체 화면과 주요 기능을 관리하는 메인 컴포넌트
function App() {
  // 별 연결선 상태
  const [connections, setConnections] = useState([]);

  const {
    islands,
    currentIsland,
    setCurrentIsland,
    memos: rawMemos,
    allMemos,
    setMemos: setRawMemos,
    fetchAllData,
    fetchMemos,
  } = useIslandsAndMemos();

  // 메모 위치 데이터와 localStorage 동기화
  const memos = useMemo(() => {
    const saved = localStorage.getItem("saved_memos_positions");

    if (!saved) return rawMemos;

    try {
      const savedMemos = JSON.parse(saved);

      return rawMemos.map((memo) => {
        const found = savedMemos.find((savedMemo) => savedMemo.id === memo.id);

        return found
          ? {
              ...memo,
              x: found.x,
              y: found.y,
              pos_x: found.pos_x,
              pos_y: found.pos_y,
            }
          : memo;
      });
    } catch (e) {
      return rawMemos;
    }
  }, [rawMemos]);

  // 메모 위치 변경 및 localStorage 저장
  const setMemos = (updater) => {
    if (typeof updater === "function") {
      setRawMemos((prev) => {
        const next = updater(prev);

        localStorage.setItem("saved_memos_positions", JSON.stringify(next));

        return next;
      });
    } else {
      setRawMemos(updater);

      localStorage.setItem("saved_memos_positions", JSON.stringify(updater));
    }
  };

  const fieldRef = useRef(null);

  // 섬 스크롤과 현재 섬 동기화
  const { isTextVisible, handleScroll } = useIslandScrollSync(
    fieldRef,
    islands,
    setCurrentIsland,
  );

  // 별자리 연결 및 AI 관련 상태
  const {
    isConstellationActive,
    setIsConstellationActive,
    constellationData,
    connectByKeywords,
  } = useConstellation();

  // 메모 입력 및 AI 처리 상태
  const [content, setContent] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // 메모 제목 입력 모달 상태
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [memoTitle, setMemoTitle] = useState("");

  // 선택된 메모와 지도 모달 상태
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // 섬 생성 모달 및 입력 상태
  const [isAddIslandOpen, setIsAddIslandOpen] = useState(false);
  const [newIslandName, setNewIslandName] = useState("");
  const [newIslandSubtitle, setNewIslandSubtitle] = useState("");

  // 현재 섬 정보
  const activeIslandInfo =
    islands.find((island) => island.id === currentIsland) || islands[0] || {};

  // 메모 제목 입력 모달 열기
  const handleOpenTitleModal = (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("메모 내용을 입력해주세요!");
      return;
    }

    setIsTitleModalOpen(true);
  };

  // AI 메모 생성
  const handleFinalCreateAIMemo = async () => {
    setLoadingAI(true);
    setIsTitleModalOpen(false);

    try {
      const response = await api.createAIMemo({
        title: memoTitle.trim() || "무명의 별",
        content,
        island_id: currentIsland,
      });

      console.log("🔥 AI memoTitle:", memoTitle);
      if (response.status === 201) {
        setContent("");
        setMemoTitle("");
        fetchAllData();
      }
    } catch (err) {
      console.error("AI 메모 생성 에러:", err);
      alert("AI 메모를 생성하는 중 오류가 발생했습니다.");
    } finally {
      setLoadingAI(false);
    }
  };

  // 메모 별 위치 변경 및 저장
  const handleUpdateMemoPosition = (memoId, newX, newY, isFinished) => {
    setMemos((prevMemos) => {
      const updated = prevMemos.map((memo) => {
        if (memo.id === memoId) {
          return {
            ...memo,
            x: newX,
            y: newY,
            pos_x: newX,
            pos_y: newY,
          };
        }

        return memo;
      });

      if (isFinished) {
        localStorage.setItem("saved_memos_positions", JSON.stringify(updated));
      }

      return updated;
    });
  };

  // AI 메모 자동배치 및 연결선 생성
  const handleAutoArrange = async () => {
    if (memos.length === 0) {
      alert("배치할 메모가 없습니다.");
      return;
    }

    if (!currentIsland) {
      alert("현재 섬을 선택해주세요.");
      return;
    }

    setLoadingAI(true);

    try {
      const response = await api.autoLayoutMemos(currentIsland);

      if (response.data.success) {
        const { layouts, connections: newConnections } = response.data.data;

        console.log("📍 AI 배치 좌표:", layouts);

        // AI가 계산한 메모 위치 반영
        setMemos((prevMemos) =>
          prevMemos.map((memo) => {
            const layout = layouts.find((item) => item.id === memo.id);

            if (!layout) return memo;

            return {
              ...memo,
              x: layout.x_coord,
              y: layout.y_coord,
              pos_x: layout.x_coord,
              pos_y: layout.y_coord,
            };
          }),
        );

        // 현재 섬의 연결선만 갱신
        const currentIslandMemoIds = new Set(
          memos
            .filter((memo) => memo.island_id === currentIsland)
            .map((memo) => memo.id),
        );

        setConnections((prevConnections) => {
          const otherIslandConnections = prevConnections.filter(
            (connection) =>
              !currentIslandMemoIds.has(connection.fromId) &&
              !currentIslandMemoIds.has(connection.toId),
          );

          return [...otherIslandConnections, ...(newConnections || [])];
        });

        setIsConstellationActive(true);

        console.log("🔗 실제 연결:", newConnections);
        console.log("🌌 AI 자동배치 완료");
        console.log("그룹 수:", response.data.data.groupCount);
        console.log("연결 수:", newConnections?.length || 0);
      }
    } catch (error) {
      console.error("❌ AI 자동배치 오류:", error);
      alert("AI 자동배치 중 오류가 발생했습니다.");
    } finally {
      setLoadingAI(false);
    }
  };

  // 선택한 섬으로 이동
  const jumpToIsland = (index) => {
    const field = fieldRef.current;

    if (!field) return;

    field.scrollTo({
      left: index * 2400,
      behavior: "smooth",
    });

    setIsMapOpen(false);
  };

  // 새로운 섬 생성
  const handleCreateIsland = async (e) => {
    e.preventDefault();

    if (!newIslandName.trim()) {
      alert("섬 이름을 입력해 주세요!");
      return;
    }

    try {
      const res = await api.createIsland({
        name: newIslandName,
        subtitle: newIslandSubtitle || "새롭게 발견된 미지의 공간",
        bg_class: "theme-starlight",
      });

      if (res.data.success) {
        fetchAllData();

        setNewIslandName("");
        setNewIslandSubtitle("");
        setIsAddIslandOpen(false);

        alert("새로운 섬이 성공적으로 개척되었습니다! 🚀");
      }
    } catch (err) {
      console.error("섬 생성 에러:", err);
      alert("섬을 생성하는 중 오류가 발생했습니다.");
    }
  };

  // 섬 삭제
  const handleDeleteIsland = async (islandId) => {
    const island = islands.find((island) => island.id === islandId);

    if (!island) return;

    const confirmed = window.confirm(
      `"${island.name}" 섬을 삭제하시겠습니까?\n\n섬 안의 모든 메모도 함께 삭제됩니다.`,
    );

    if (!confirmed) return;

    try {
      await api.deleteIsland(islandId);

      // 현재 섬을 삭제한 경우 다른 섬으로 이동
      if (currentIsland === islandId) {
        const remainingIslands = islands.filter(
          (island) => island.id !== islandId,
        );

        if (remainingIslands.length > 0) {
          setCurrentIsland(remainingIslands[0].id);
        } else {
          setCurrentIsland(null);
        }
      }

      // 최신 섬 및 메모 데이터 갱신
      await fetchAllData();

      alert("섬이 삭제되었습니다.");
    } catch (err) {
      console.error("섬 삭제 실패:", err);
      alert("섬을 삭제하는 중 오류가 발생했습니다.");
    }
  };

  // 메모 삭제
  const handleDeleteMemo = async (memoId) => {
    try {
      await api.deleteMemo(memoId);

      setSelectedMemo(null);
      fetchAllData();
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 메모를 다른 섬으로 이동
  const handleMoveMemo = async (memoId, islandId) => {
    try {
      await api.moveMemo(memoId, islandId);

      setSelectedMemo(null);

      // 최신 섬 및 메모 데이터 갱신
      await fetchAllData();

      alert("메모가 새로운 섬으로 이동되었습니다. 🚀");
    } catch (err) {
      console.error("메모 이동 실패:", err);
      alert("메모를 이동하는 중 오류가 발생했습니다.");
    }
  };

  // 화면 구성
  return (
    <div className={`starry-ocean-container ${activeIslandInfo.bgClass}`}>
      {/* 밤하늘 배경 */}
      <NightSkyBackground islands={islands} fieldRef={fieldRef} />

      {/* 미니맵 */}
      <MiniMap
        islands={islands}
        memos={memos}
        connections={connections}
        currentIsland={currentIsland}
        onOpenMap={() => setIsMapOpen(true)}
      />

      {/* 전체 지도 모달 */}
      <MapModal
        isOpen={isMapOpen}
        islands={islands}
        currentIsland={currentIsland}
        onClose={() => setIsMapOpen(false)}
        onJumpToIsland={jumpToIsland}
        onOpenAddIsland={() => setIsAddIslandOpen(true)}
        onDeleteIsland={handleDeleteIsland}
      />

      {/* 메인 별자리 영역 */}
      <StarField
        fieldRef={fieldRef}
        islands={islands}
        memos={memos}
        connections={connections}
        currentIsland={currentIsland}
        isTextVisible={isTextVisible}
        onScroll={handleScroll}
        onSelectMemo={setSelectedMemo}
        onUpdateMemoPosition={handleUpdateMemoPosition}
      />

      {/* 하단 메모 입력 및 AI 자동배치 */}
      <BottomControls
        isConstellationActive={isConstellationActive}
        loadingAI={loadingAI}
        onAutoArrange={handleAutoArrange}
        content={content}
        onChangeContent={setContent}
        onSubmit={handleOpenTitleModal}
        islandName={activeIslandInfo.name}
      />

      {/* 메모 제목 입력 */}
      <TitleModal
        isOpen={isTitleModalOpen}
        content={content}
        memoTitle={memoTitle}
        onChangeTitle={(e) => setMemoTitle(e.target.value)}
        onSubmit={handleFinalCreateAIMemo}
        onClose={() => setIsTitleModalOpen(false)}
      />

      {/* 메모 상세 및 이동 */}
      <MemoModal
        memo={selectedMemo}
        islands={islands}
        onClose={() => setSelectedMemo(null)}
        onDelete={handleDeleteMemo}
        onMoveMemo={handleMoveMemo}
      />

      {/* 섬 생성 */}
      <AddIslandModal
        isOpen={isAddIslandOpen}
        name={newIslandName}
        subtitle={newIslandSubtitle}
        onChangeName={setNewIslandName}
        onChangeSubtitle={setNewIslandSubtitle}
        onSubmit={handleCreateIsland}
        onClose={() => setIsAddIslandOpen(false)}
      />
    </div>
  );
}

export default App;
