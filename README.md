# 🌟 Please-Hug_FrontEnd 🌟

<div align="center">
  <img src="https://via.placeholder.com/500x200?text=Please-Hug+LMS" alt="Please-Hug Logo" width="500"/>
  <br>
  <br>

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-purple.svg)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-orange.svg)](https://github.com/pmndrs/zustand)
[![SCSS](https://img.shields.io/badge/SCSS-1.89-pink.svg)](https://sass-lang.com/)

</div>

## 📋 목차

- [소개](#-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [설치 및 실행 방법](#-설치-및-실행-방법)
- [주요 페이지](#-주요-페이지)
- [컴포넌트 구조](#-컴포넌트-구조)
- [API 연동](#-api-연동)
- [상태 관리](#-상태-관리)

## 📚 소개

**Please-Hug_FrontEnd**는 Goorm EXP를 클론 코딩하여 만든 React 기반의 LMS(Learning Management System) 프론트엔드 애플리케이션입니다. 배움일기, 미션 관리, 퀘스트 시스템, 칭찬 기능, 상점 등 학습자의 성장을 지원하는 다양한 기능을 제공합니다.

<div align="center">
  <img src="https://via.placeholder.com/800x400?text=System+Overview" alt="System Overview" width="800"/>
</div>

## ✨ 주요 기능

| 기능               | 설명                                          |
| ------------------ | --------------------------------------------- |
| 📖 **배움일기**    | 학습 기록 작성, 조회, 댓글 및 좋아요 기능     |
| 🎯 **미션 시스템** | 미션 그룹별 미션 진행, 태스크 관리 및 피드백  |
| 🎮 **퀘스트**      | 일일 퀘스트 수행 및 보상 시스템               |
| 🙌 **칭찬 시스템** | 사용자 간 칭찬 작성 및 이모지 반응            |
| 🛒 **상점**        | 포인트를 활용한 아이템 구매 및 구매 내역 조회 |
| 🏆 **랭킹**        | 사용자 경험치 및 활동 기반 랭킹 시스템        |
| 👤 **사용자 관리** | 프로필 관리 및 개인화 설정                    |
| 🔔 **알림 시스템** | 실시간 알림 및 활동 피드백                    |

## 🛠 기술 스택

### 프론트엔드 핵심

- **라이브러리 & 프레임워크**: React 19, React Router 7
- **빌드 도구**: Vite 6
- **상태 관리**: Zustand 5
- **스타일링**: SCSS, CSS Modules

### UI 컴포넌트 & 유틸리티

- **마크다운 에디터**: @uiw/react-md-editor
- **아이콘**: React Icons
- **드래그 & 드롭**: @hello-pangea/dnd
- **날짜 관리**: date-fns

### 네트워킹 & 인증

- **HTTP 클라이언트**: Axios
- **인증**: JWT (jwt-decode)
- **서버 이벤트**: EventSource

### 개발 도구

- **코드 품질**: ESLint, Prettier
- **번들링 최적화**: Terser

## 📂 프로젝트 구조

```
src/
  api/                # API 서비스 및 HTTP 클라이언트 설정
  assets/             # 정적 리소스 (이미지, 폰트 등)
  components/         # 재사용 가능한 UI 컴포넌트
    common/           # 공통 컴포넌트 (버튼, 모달 등)
    Dashboard/        # 대시보드 관련 컴포넌트
    Mission/          # 미션 관련 컴포넌트
    Quest/            # 퀘스트 관련 컴포넌트
    Admin/            # 관리자 화면 컴포넌트
  layouts/            # 페이지 레이아웃 컴포넌트
  pages/              # 라우팅 가능한 페이지 컴포넌트
    admin/            # 관리자 페이지
    mission/          # 미션 관련 페이지
    Quest/            # 퀘스트 관련 페이지
    Shop/             # 상점 관련 페이지
    studyDiary/       # 배움일기 관련 페이지
    user/             # 사용자 관련 페이지 (프로필, 랭킹 등)
  routes/             # 라우팅 설정
  stores/             # Zustand 상태 관리 스토어
  utils/              # 유틸리티 함수 및 헬퍼
```

## 🚀 설치 및 실행 방법

### 사전 요구사항

- Node.js 20 이상
- npm 또는 yarn

### 로컬 개발 환경 설정

1. **저장소 클론**

   ```bash
   git clone https://github.com/Please-Hug/Please-Hug_FrontEnd.git
   cd Please-Hug_FrontEnd
   ```

2. **의존성 설치**

   ```bash
   npm install
   ```

3. **개발 서버 실행**

   ```bash
   npm run dev
   ```

   개발 서버는 기본적으로 http://localhost:5173 에서 실행됩니다.

4. **빌드**
   ```bash
   npm run build
   ```

### Docker를 이용한 실행

1. **개발 환경**

   ```bash
   docker-compose up
   ```

2. **프로덕션 환경**
   ```bash
   docker-compose -f docker-compose.prod.yml up
   ```

## 📱 주요 페이지

| 페이지        | 경로                  | 설명                               |
| ------------- | --------------------- | ---------------------------------- |
| 대시보드      | `/dashboard`          | 사용자 활동 요약 및 주요 정보 확인 |
| 미션          | `/mission`            | 미션 그룹 및 개별 미션 목록        |
| 미션 상세     | `/mission/:missionId` | 미션 세부 내용 및 태스크 관리      |
| 퀘스트        | `/quest`              | 일일 퀘스트 목록 및 상태           |
| 배움일기 목록 | `/study-diary`        | 전체 배움일기 목록                 |
| 배움일기 작성 | `/study-diary/write`  | 새 배움일기 작성 폼                |
| 배움일기 상세 | `/study-diary/:id`    | 배움일기 상세 보기 및 댓글         |
| 칭찬          | `/praises`            | 칭찬 작성 및 목록 보기             |
| 상점          | `/shop`               | 상점 아이템 및 포인트 사용         |
| 랭킹          | `/ranking`            | 사용자 경험치 및 활동 랭킹         |
| 프로필        | `/profile`            | 사용자 정보 관리                   |

## 🧩 컴포넌트 구조

- **레이아웃 컴포넌트**
  - `MainLayout`: 일반 사용자 화면의 기본 레이아웃
  - `AdminLayout`: 관리자 전용 레이아웃

- **공통 컴포넌트**
  - `Sidebar`: 사이드바 네비게이션
  - `SideModal`: 측면에서 열리는 모달 다이얼로그
  - `TabComponent`: 탭 기반 컨텐츠 전환 컴포넌트
  - `Notification`: 알림 시스템 컴포넌트

- **기능별 컴포넌트**
  - `StudyDiaryEditor`: 마크다운 기반 배움일기 에디터
  - `MissionBoard`: 칸반 방식의 미션 보드
  - `QuestItem`: 퀘스트 항목 컴포넌트
  - `MissionTask`: 미션 태스크 관리 컴포넌트

## 🔌 API 연동

API 요청은 `/src/api/` 디렉토리의 서비스 모듈에서 관리됩니다:

- `axiosInstance.js`: Axios 인스턴스 및 인터셉터 설정
- `studyDiaryService.js`: 배움일기 관련 API 요청 처리
- `missionService.js`: 미션 관련 API 요청 처리
- `praiseService.js`: 칭찬 관련 API 요청 처리
- `userService.js`: 사용자 정보 및 인증 관련 API 요청 처리
- `adminService.js`: 관리자 기능 관련 API 요청 처리

## 🗄 상태 관리

상태 관리는 Zustand를 사용하며, `/src/stores/` 디렉토리에서 관리됩니다:

- `userStore`: 사용자 정보 및 인증 상태 관리
- `tokenPayloadStore`: JWT 토큰 페이로드 상태 관리
- `breadcrumbStore`: 페이지 이동 경로 관리

## 📝 개발자 참고사항

- CSS는 CSS Modules 패턴을 사용하여 스타일 격리
- 코드 품질 유지를 위해 커밋 전 ESLint 및 Prettier 실행 권장
- 백엔드 API 명세를 참고하여 `src/api/` 디렉토리의 서비스 모듈 구현
