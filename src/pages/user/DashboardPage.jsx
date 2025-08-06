import React, { useState, useEffect } from "react"; 
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
import LatestRecruitmentCarousel from "../../components/Dashboard/LatestRecruitmentCarousel";
import useUserStore from "../../stores/userStore";
import api from "../../api/axiosInstance";
import useBreadcrumbStore from "../../stores/breadcrumbStore";
import BookmarkSection from "../../components/Dashboard/BookmarkSection";
import AdminButton from "../../components/Admin/AdminButton";
import ProjectOverviewModal from "../../components/Project/ProjectOverviewModal"; 

function DashboardPage() {
  const userInfo = useUserStore((state) => state.userInfo);
  const { setBreadcrumbItems } = useBreadcrumbStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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

      {userInfo.role === "ADMIN" && <AdminButton />}

      <DashboardMenu />
      <div>
        {" "}
        <BookmarkSection />
      </div>
      <div className={styles.dashboardContent}>
        <div className={styles.dashboardLeft}>
          <RecentLearning onStartLearningClick={openModal} />
          <LearningPlans />
          <RecentDiary />
          <LatestRecruitmentCarousel />
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

      {isModalOpen && <ProjectOverviewModal onClose={closeModal} />}
    </div>
  );
}

function DashboardGreeting({ name, className }) {
  return <h2 className={className}>{name}님, 오늘도 화이팅이에요!</h2>;
}

export default DashboardPage;