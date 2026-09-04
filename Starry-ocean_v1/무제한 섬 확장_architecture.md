# Starry Ocean: 무제한 섬 확장 아키텍처 설계서

이 문서는 사용자가 직접 무제한으로 우주 섬을 개척하고 확장할 수 있는 **'Starry Ocean'** 서비스의 동적 아키텍처 설계서입니다.

---

## 1. 시스템 개요 (System Overview)

- **프론트엔드**: React, Axios, CSS Flex/Absolute Layout (동적 가로 폭 확장 및 가로 파노라마 스크롤)
- **백엔드**: Node.js, Express (RESTful API)
- **데이터베이스**: MySQL (`islands` 및 `memos` 테이블 간 1:N 관계형 구조)

---

## 2. 데이터베이스 아키텍처 (Database Schema)

무제한 섬 시스템을 지탱하기 위해 기존 하드코딩된 섬 데이터를 **`islands` 테이블**로 분리합니다.

### `islands` 테이블 (섬 정보)

| 컬럼명       | 타입         | 제약조건                    | 설명                                |
| :----------- | :----------- | :-------------------------- | :---------------------------------- |
| `id`         | INT          | AUTO_INCREMENT, PRIMARY KEY | 섬 고유 ID                          |
| `name`       | VARCHAR(100) | NOT NULL                    | 섬 이름 (예: "✨ 5호: 은하수 정원") |
| `subtitle`   | VARCHAR(255) | NULL                        | 섬 부제 / 설명                      |
| `bg_class`   | VARCHAR(50)  | DEFAULT 'theme-starlight'   | 배경 테마 스타일 클래스             |
| `created_at` | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP   | 생성일시                            |

### `memos` 테이블 (별/메모 정보)

| 컬럼명       | 타입      | 제약조건                    | 설명                    |
| :----------- | :-------- | :-------------------------- | :---------------------- |
| `id`         | INT       | AUTO_INCREMENT, PRIMARY KEY | 메모 고유 ID            |
| `island_id`  | INT       | FOREIGN KEY (`islands.id`)  | 소속된 섬 ID            |
| `content`    | TEXT      | NOT NULL                    | 메모 내용               |
| `x_coord`    | FLOAT     | DEFAULT 0.0                 | 섬 내부 상대 X 좌표     |
| `y_coord`    | FLOAT     | DEFAULT 0.0                 | 화면 내 수직 Y 좌표 (%) |
| `embedding`  | JSON      | NULL                        | AI 분석용 임베딩 벡터   |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP   | 작성일시                |

---

## 3. 백엔드 API 설계 (Backend API Specification)

동적 섬 추가와 전체 메모 조회를 위한 핵심 엔드포인트입니다.

- **섬 관련 API**
  - `GET /api/islands`: 등록된 모든 섬 목록 조회
  - `POST /api/islands`: 새로운 섬 개척(생성)
    - Request Body: `{ name, subtitle, bg_class }`

- **메모 관련 API**
  - `GET /api/memos/all`: 전체 섬에 속한 모든 메모를 한 번에 조회 (가로 은하계 렌더링용)
  - `POST /api/ai/memos`: 특정 섬(`island_id`)에 AI 분석이 포함된 메모 생성

---

## 4. 프론트엔드 아키텍처 (Frontend Architecture)

### 4.1. 동적 가로 폭 계산 (`App.jsx`)

기존의 고정된 가로 폭(`9600px`) 대신, **등록된 섬의 총 개수**에 비례하여 컨테이너 폭을 동적으로 확장합니다.

- **계산 공식**: `Total Width = Islands Count * 2400px`

### 4.2. 컴포넌트 렌더링 파이프라인

1. **초기 로드**: 컴포넌트 마운트 시 `GET /api/islands`와 `GET /api/memos/all`을 병렬 호출하여 상태(`islands`, `memos`)에 저장합니다.
2. **동적 구역 배치**: `islands` 배열을 `map` 함수로 순회하며 각 섬의 오프셋 위치(`index * 2400px`)에 맞게 구역을 렌더링합니다.
3. **메모 필터링**: 각 섬 구역 내에서 `memo.island_id === island.id`인 별들만 골라 상대 좌표(`memo.x % 2400`)로 그립니다.

---

## 5. 미래 확장 계획 (Scalability & UX Notes)

- **미니맵 / 빠른 이동 드로어 도입**: 섬이 10개 이상으로 늘어날 경우를 대비해, 화면 우측 하단에 전체 섬을 한눈에 보고 클릭 한 번에 해당 위치로 `scrollTo`할 수 있는 내비게이션 바 추가.
- **가상화(Virtualization) 고려**: 메모와 섬이 수천 개 이상으로 늘어날 경우, 화면에 보이는 영역(`Viewport`) 주변의 섬만 렌더링하는 최적화 도입 검토.
