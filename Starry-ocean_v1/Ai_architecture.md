# Starry Ocean: AI Agent Integration Architecture

## 1. 개요 (Overview)

'Starry Ocean' 프로젝트에 AI 에이전트를 도입하여 사용자의 메모를 지능적으로 분석하고, 우주 공간(섬) 속에서 별(메모)과 별자리(연관 관계)를 자동으로 연결·조직화하는 아키텍처 설계서입니다.

---

## 2. 시스템 아키텍처 (System Architecture)

```
[ Frontend (React + Vite) ]
  ├── 듀얼 작성 버튼 UI (직접 작성 vs AI 자동 분석)
  ├── 우주 공간 렌더링 (Canvas / SVG Line Renderer)
  └── 실시간 별자리 명칭 표출 컴포넌트
        │
        │ (Axios API Request)
        ▼
[ Backend (Node.js + Express) ]
  ├── 메모 CRUD Controller
  ├── AI Agent Orchestrator (OpenAI / Embedding API)
  └── 연관도 계산 및 클러스터링 엔진
        │
        │ (SQL Queries)
        ▼
[ Database (MySQL) ]
  ├── Memos Table (id, content, island_id, x_coord, y_coord, embedding_vector, keywords)
  ├── Connections Table (memo_id_1, memo_id_2, similarity_score)
  └── Constellations Table (id, name, island_id, summary)
```

---

## 3. 핵심 기능별 상세 설계 (Core Feature Design)

### 3.1 듀얼 작성 버튼 (Dual Write Mode)

- **[직접 작성 모드]**: 사용자가 선택한 특정 섬(구역) 및 지정 위치에 수동으로 별(메모)을 생성합니다.
- **[AI 자동 분석 작성 모드]**:
  1. 입력된 메모 내용을 백엔드로 전송합니다.
  2. AI가 내용을 분석하여 가장 적합한 섬과 좌표를 결정합니다.
  3. 기존 메모 개수가 10개 이상일 경우, 유사도가 가장 높은 기존 별 근처에 자동으로 배치합니다.

### 3.2 AI 키워드 추출 및 연관도 분석

- **텍스트 임베딩**: OpenAI Embedding API 등을 활용하여 메모 내용을 벡터화합니다.
- **유사도 측정**: 코사인 유사도(Cosine Similarity)를 계산하여 기존 메모들과의 연관도를 수치화합니다.
- **키워드 추출**: LLM을 통해 핵심 키워드 및 카테고리를 도출하여 DB에 저장합니다.

### 3.3 동적 별 위치 조정 및 선 렌더링 (Constellation Engine)

- **자동 선 연결**: 연관도 점수가 특정 임계값(Threshold)을 넘는 메모 쌍(Pair)을 `Connections` 테이블에 기록하고 프론트엔드에서 선으로 렌더링합니다.
- **별자리 자동 명명**: 연관된 별들이 하나의 군집을 이룰 때, LLM이 공통 키워드를 기반으로 별자리 이름(예: "공부 별자리", "레시피 별자리")을 동적으로 생성합니다.

---

## 4. 데이터베이스 스키마 (MySQL Schema Draft)

### `memos` 테이블

- `id` (INT, PK)
- `island_id` (INT)
- `content` (TEXT)
- `keywords` (VARCHAR)
- `x_coord` (FLOAT)
- `y_coord` (FLOAT)
- `embedding` (JSON 또는 TEXT)
- `created_at` (TIMESTAMP)

### `constellations` 테이블

- `id` (INT, PK)
- `island_id` (INT)
- `constellation_name` (VARCHAR)
- `description` (TEXT)
- `created_at` (TIMESTAMP)
