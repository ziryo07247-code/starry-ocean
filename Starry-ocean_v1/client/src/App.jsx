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

function App() {
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

  // ✨ localStorage에 저장된 커스텀 위치를 기존 메모 데이터와 병합
  const memos = useMemo(() => {
    const saved = localStorage.getItem("saved_memos_positions");
    if (!saved) return rawMemos;
    try {
      const savedMemos = JSON.parse(saved);
      return rawMemos.map((memo) => {
        const found = savedMemos.find((s) => s.id === memo.id);
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

  // ✨ 커스텀 setMemos (로컬스토리지 동기화 포함)
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

  const { isTextVisible, handleScroll } = useIslandScrollSync(
    fieldRef,
    islands,
    setCurrentIsland,
  );

  const {
    isConstellationActive,
    setIsConstellationActive,
    constellationData,
    connectByKeywords,
  } = useConstellation();

  const [content, setContent] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // 별 제목 입력 모달 상태
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [memoTitle, setMemoTitle] = useState("");

  const [selectedMemo, setSelectedMemo] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isAddIslandOpen, setIsAddIslandOpen] = useState(false);
  const [newIslandName, setNewIslandName] = useState("");
  const [newIslandSubtitle, setNewIslandSubtitle] = useState("");

  const activeIslandInfo =
    islands.find((i) => i.id === currentIsland) || islands[0] || {};

  const handleOpenTitleModal = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("메모 내용을 입력해주세요!");
      return;
    }
    setIsTitleModalOpen(true);
  };

  const handleFinalCreateAIMemo = async () => {
    setLoadingAI(true);
    setIsTitleModalOpen(false);

    try {
      const response = await api.createAIMemo({
        title: memoTitle.trim() || "무명의 별",
        content,
        island_id: currentIsland,
      });

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

  // ✨ 별 위치 변경 및 저장 핸들러 함수 추가
  const handleUpdateMemoPosition = (memoId, newX, newY, isFinished) => {
    setMemos((prevMemos) => {
      const updated = prevMemos.map((memo) => {
        if (memo.id === memoId) {
          return { ...memo, x: newX, y: newY, pos_x: newX, pos_y: newY };
        }
        return memo;
      });

      // 드래그가 끝났을 때(isFinished === true) localStorage에 최종 저장
      if (isFinished) {
        localStorage.setItem("saved_memos_positions", JSON.stringify(updated));
      }

      return updated;
    });
  };

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
        // AI가 계산한 위치를 현재 메모에 반영
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

        // AI가 계산한 연결선 반영
        // ⚠️ 서버는 "현재 섬"의 연결선만 돌려주기 때문에, 그냥 통째로 교체하면
        // 다른 섬에서 이미 만들어둔 연결선이 사라진다. 그래서 현재 섬에 속한
        // 연결선만 골라내서 교체하고, 다른 섬의 연결선은 그대로 유지한다.
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

  const jumpToIsland = (index) => {
    const field = fieldRef.current;
    if (!field) return;
    field.scrollTo({ left: index * 2400, behavior: "smooth" });
    setIsMapOpen(false);
  };

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

  const handleDeleteIsland = async (islandId) => {
    const island = islands.find((i) => i.id === islandId);

    if (!island) return;

    const confirmed = window.confirm(
      `"${island.name}" 섬을 삭제하시겠습니까?\n\n섬 안의 모든 메모도 함께 삭제됩니다.`,
    );

    if (!confirmed) return;

    try {
      await api.deleteIsland(islandId);

      // 현재 선택된 섬을 삭제했다면 다른 섬으로 이동
      if (currentIsland === islandId) {
        const remainingIslands = islands.filter((i) => i.id !== islandId);

        if (remainingIslands.length > 0) {
          setCurrentIsland(remainingIslands[0].id);
        } else {
          setCurrentIsland(null);
        }
      }

      // DB에서 최신 섬/메모 다시 가져오기
      await fetchAllData();

      alert("섬이 삭제되었습니다.");
    } catch (err) {
      console.error("섬 삭제 실패:", err);
      alert("섬을 삭제하는 중 오류가 발생했습니다.");
    }
  };

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

  const handleMoveMemo = async (memoId, islandId) => {
    try {
      await api.moveMemo(memoId, islandId);

      setSelectedMemo(null);

      // 섬/메모 데이터 다시 불러오기
      await fetchAllData();

      alert("메모가 새로운 섬으로 이동되었습니다. 🚀");
    } catch (err) {
      console.error("메모 이동 실패:", err);
      alert("메모를 이동하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={`starry-ocean-container ${activeIslandInfo.bgClass}`}>
      <NightSkyBackground islands={islands} fieldRef={fieldRef} />
      <MiniMap
        islands={islands}
        memos={memos}
        connections={connections}
        currentIsland={currentIsland}
        onOpenMap={() => setIsMapOpen(true)}
      />

      <MapModal
        isOpen={isMapOpen}
        islands={islands}
        currentIsland={currentIsland}
        onClose={() => setIsMapOpen(false)}
        onJumpToIsland={jumpToIsland}
        onOpenAddIsland={() => setIsAddIslandOpen(true)}
        onDeleteIsland={handleDeleteIsland}
      />

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

      <BottomControls
        isConstellationActive={isConstellationActive}
        loadingAI={loadingAI}
        onAutoArrange={handleAutoArrange}
        content={content}
        onChangeContent={setContent}
        onSubmit={handleOpenTitleModal}
        islandName={activeIslandInfo.name}
      />

      <TitleModal
        isOpen={isTitleModalOpen}
        content={content}
        memoTitle={memoTitle}
        onChangeTitle={(e) => setMemoTitle(e.target.value)}
        onSubmit={handleFinalCreateAIMemo}
        onClose={() => setIsTitleModalOpen(false)}
      />

      <MemoModal
        memo={selectedMemo}
        islands={islands}
        onClose={() => setSelectedMemo(null)}
        onDelete={handleDeleteMemo}
        onMoveMemo={handleMoveMemo}
      />

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
