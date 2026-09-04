# 별바다 (Starry Ocean) - 3D 360도 무인도 메모 & 별자리 프로젝트

> 사용자가 360도 밤바다와 무인도 공간 속에서 메모를 남기며 자신만의 '별자리'를 만들어가는 인터랙티브 웹 서비스입니다.

---

## 프로젝트 개요

- **목표:** 통신, MySQL 연동, Python AI 연동, 그리고 Node.js에서 Spring Boot로의 마이그레이션을 경험하기 위한 풀스택 개인 프로젝트
- **핵심 기능:**
  - 세계 지도에서 선택하는 **10개의 다양한 무인도 환경(테마)**
  - 무인도 내부의 **360도 공간(3D)**에서 펼쳐지는 메모(별) 생성 및 조회
  - 중요도(Level) 및 **Python AI 기반 텍스트 유사도 분석**을 통한 자동 별자리(선) 연결
  - Node.js 백엔드 구축 후 **Spring Boot로 마이그레이션** 고도화

---

## 기술 스택 (예정)

- **Frontend:** React, Three.js / Canvas
- **Backend (Step 1~3):** Node.js (Express / NestJS), MySQL
- **Backend (Final Step):** Java, Spring Boot, MySQL
- **AI Server:** Python (FastAPI 또는 Flask), NLP / Text Embedding

---

## Database Schema

### 1. `islands` (무인도 정보)

| 컬럼명        | 데이터 타입 | 설명                      |
| :------------ | :---------- | :------------------------ |
| `id`          | LONG (PK)   | 무인도 고유 번호 (1 ~ 10) |
| `island_name` | VARCHAR     | 섬 이름 (예: 새벽녘의 섬) |
| `theme_code`  | VARCHAR     | 프론트엔드 환경 테마 코드 |
| `description` | TEXT        | 섬 설명                   |

### 2. `stars` (별 / 메모 정보)

| 컬럼명                    | 데이터 타입   | 설명                          |
| :------------------------ | :------------ | :---------------------------- |
| `id`                      | LONG (PK)     | 별 고유 번호                  |
| `island_id`               | LONG (FK)     | 속한 무인도 ID (`islands.id`) |
| `content`                 | TEXT          | 메모 내용                     |
| `importance_level`        | INT / VARCHAR | 중요도 또는 레벨 (Level 1~3)  |
| `pos_x`, `pos_y`, `pos_z` | FLOAT         | 360도 공간 3D 좌표값          |
| `parent_id`               | LONG (FK)     | 별자리 연결을 위한 부모 별 ID |
| `created_at`              | TIMESTAMP     | 생성일시                      |

---

## System Architecture

[ Frontend ] [ Backend Server ] [ Database ]
React (3D/360 UI) <> Node.js (1단계) / Spring (최종) <> MySQL
│
│ (REST API)
▼
[ AI Server (Python) ]

- 텍스트 유사도 분석
- 자동 별자리(parent_id) 매칭

---

## Development Roadmap

- [ ] **Step 1:** 단일 무인도 환경 구축 + Node.js/MySQL 기본 CRUD API 구현
- [ ] **Step 2:** 세계 지도(10개 섬) 및 360도 뷰어 UI 확장
- [ ] **Step 3:** Python AI 서버 연동 (메모 자동 유사도 분석 및 별자리 연결)
- [ ] **Step 4:** Node.js 백엔드를 Java Spring Boot로 마이그레이션 및 아키텍처 고도화

---

## 리팩터링 노트 (2026-09)

기존 `App.jsx`(994줄) / `server.js`에 뭉쳐있던 로직을 아래처럼 분리했습니다.

```
server/
├── config/db.js
├── services/embeddingService.js
├── controllers/{islandController,memoController,aiMemoController}.js
├── routes/{islands,memos,aiMemos}.js
└── server.js

client/src/
├── api/client.js
├── hooks/{useIslandsAndMemos,useDragScroll,useConstellation,useIslandScrollSync}.js
├── utils/starPosition.js
├── components/{IslandNav,MapModal,AddIslandModal,MemoModal,ConstellationBanner,StarField,BottomControls,NightSkyBackground}.jsx
└── App.jsx
```

**같이 제거한 죽은 코드**: `routes/DELETE.js`(깨진 파일), `routes/memo.js`의 랜덤 요소 섞인 `/constellation`(미사용·중복 로직), `api/aiMemoApi.js` / `api/AIMemoInput.jsx`(미사용, import도 주석 처리되어 있었음), `App.jsx`의 `handleCreateMemo` / `fetchAllIslandMemos`(미사용 함수), `activeIsland` / `showComment` state(값을 세팅하는 곳이 없어 항상 비활성 상태였음).

**아직 남아있는 핵심 이슈** (다음 작업 후보):
- `server/controllers/aiMemoController.js`의 `autoLayoutMemos`(임베딩 유사도 기반 진짜 AI 배치)가 프론트에서 아직 호출되지 않음. 지금 "AI 별자리 연결" 버튼은 `useConstellation.js`의 클라이언트 키워드 매칭만 사용 중.
- DB 스키마: README 상단 표(`island_name`, `theme_code` 등)와 실제 `islands` 테이블 컬럼(`name`, `subtitle`, `bg_class`)이 불일치 — 문서 갱신 필요.
- 프론트 `activeIslandInfo.bgClass` ↔ 서버/DB `bg_class` 네이밍 불일치 확인 필요.
