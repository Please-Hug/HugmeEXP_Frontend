import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./DashboardPage.module.scss";
import emptyUserProfile from "../../assets/images/user/empty-user-profile.svg";
import DashboardMenu from "../../components/Dashboard/DashboardMenu";
import RecentLearning from "../../components/Dashboard/RecentLearning";
import LearningPlans from "../../components/Dashboard/LearningPlans";
import DailyQuest from "../../components/Dashboard/DailyQuest";
import AttendanceCheck from "../../components/Dashboard/AttendanceCheck";
import UserProfile from "../../components/Dashboard/UserProfile";
import RecentDiary from "../../components/Dashboard/RecentDiary";
import BookmarkForm from "../../components/Dashboard/BookmarkForm";
import BookmarkList from "../../components/Dashboard/BookmarkList";
import useUserStore from "../../stores/userStore";
import api from "../../api/axiosInstance";
import useBreadcrumbStore from "../../stores/breadcrumbStore";
import BookmarkSection from "../../components/Dashboard/BookmarkSection";

function DashboardPage() {
  const userInfo = useUserStore((state) => state.userInfo);
  const { setBreadcrumbItems } = useBreadcrumbStore();

  useEffect(() => {
    if (userInfo) {
      setBreadcrumbItems([
        { label: userInfo.name + "의 대시보드", path: "/" },
        {
          label: "홈",
          path: `/dashboard`,
        },
      ]);
    }
  }, [setBreadcrumbItems, userInfo]);
  
  if (!userInfo) {
    return <div>로딩중...</div>;
  }

  return (
    <div className={styles.dashboardPage}>
      <DashboardGreeting
        name={userInfo.name}
        className={styles.dashboardGreeting}
      />
      {userInfo.role === 'ADMIN' && (
        <div className="flex justify-end mb-4">
          <Link
            to="/admin"
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >관리자 페이지</Link>
        </div>
      )}
      <DashboardMenu />
      <div> <BookmarkSection/></div>
      <div className={styles.dashboardContent}>
        <div className={styles.dashboardLeft}>
          <RecentLearning />
          <LearningPlans />
          <RecentDiary />
        </div>
        <div className={styles.dashboardRight}>
          <UserProfile
            profileImg={
              userInfo.profileImage
                ? `${api.defaults.baseURL}${userInfo.profileImage}`
                : emptyUserProfile
            }
            username={userInfo.name}
            course={userInfo.course || "Hugton 알고리즘 미션 강좌"}
            rank={userInfo.rank || "0%"}
            level={userInfo.level}
            currentExp={userInfo.currentTotalExp}
            maxExp={userInfo.nextLevelTotalExp}
          />
          <AttendanceCheck />
          <DailyQuest />
        </div>
      </div>
    </div>
  );
}

function DashboardGreeting({ name, className }) {
  return <h2 className={className}>{name}님, 오늘도 화이팅이에요!</h2>;
}

export default DashboardPage;
