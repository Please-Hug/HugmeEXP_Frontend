import { Navigate, Outlet } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../pages/user/DashboardPage";
import MissionOverviewPage from "../pages/mission/MissionOverviewPage";
import QuestPage from "../pages/Quest/QuestPage";

import StudyDiaryListPage from "../pages/studyDiary/StudyDiaryListPage";
import StudyDiaryWritePage from "../pages/studyDiary/StudyDiaryWritePage";
import StudyDiaryViewPage from "../pages/studyDiary/StudyDiaryViewPage";
import StudyDiaryEditPage from "../pages/studyDiary/StudyDiaryEditPage";
import MyStudyDiaryActivity from "../pages/studyDiary/MyStudyDiaryActivity";

import LogoutPage from "../pages/user/LogoutPage";
import PraisePage from "../pages/praise/PraisePage";
import MyInfoPage from "../pages/user/MyInfoPage";
import RankingPage from "../pages/user/RankingPage";
import ShopPage from "../pages/Shop/ShopPage";
import ShopHistoryPage from "../pages/Shop/ShopHistoryPage";
import AdminShopPage from "../pages/Shop/AdminShopPage";
import MissionGroupPage from "../pages/mission/MissionGroupPage";
import AdminQuestPage from "../pages/Quest/AdminQuestPage";
import MissionDetailPage from "../pages/mission/MissionDetailPage";
import ChallengeListPage from "../pages/mission/ChallengeListPage";

export default [
  {
    element: (
      <MainLayout>
        <Outlet />
      </MainLayout>
    ),
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
        // loader: dashboardLoader, // 데이터 로더
        // errorElement: <DashboardErrorPage />, // 에러 바운더리
      },
      {
        path: "/mission",
        children: [
          {
            index: true,
            element: <MissionOverviewPage />,
          },
          {
            path: ":missionId",
            element: <MissionDetailPage />,
          },
        ],
      },
      {
        path: "/challenge",
        children: [
          {
            index: true,
            element: <ChallengeListPage />,
          },
        ],
      },
      {
        path: "/quest",
        element: <QuestPage />,
      },
      {
        path: "/logout",
        element: <LogoutPage />,
      },
      {
        path: "/praises",
        element: <PraisePage />,
      },
      // { path: "/profile", element: <ProfilePage /> },
      {
        path: "/profile",
        element: <MyInfoPage />,
      },
      {
        path: "/ranking",
        element: <RankingPage />,
      },
      {
        path: "/shop",
        element: <ShopPage />,
      },
      {
        path: "/shopHistory",
        element: <ShopHistoryPage />,
      },
      {
        path: "/adminShop",
        element: <AdminShopPage />,
      },
      {
        path: "/mission-group/:missionGroupId",
        children: [
          {
            path: "home",
            element: <MissionGroupPage componentType="home" />,
          },
          {
            path: "learning-plan",
            element: <MissionGroupPage componentType="learning-plan" />,
          },
        ],
      },
      {
        path: "/adminQuest",
        element: <AdminQuestPage />,
      },
      // 배움일기 관련 라우트
      {
        path: "/study-diary",
        element: <StudyDiaryListPage />,
      },
      {
        path: "/study-diary/write",
        element: <StudyDiaryWritePage />,
      },
      {
        path: "/study-diary/:id",
        element: <StudyDiaryViewPage />,
      },
      {
        path: "/study-diary/edit/:id",
        element: <StudyDiaryEditPage />,
      },
      // 나의 활동 페이지
      {
        path: "/my-activity",
        element: <MyStudyDiaryActivity />,
      },
      // { path: "/settings", element: <SettingsPage /> },
      // ... 추가 사용자 경로
    ],
  },
];
