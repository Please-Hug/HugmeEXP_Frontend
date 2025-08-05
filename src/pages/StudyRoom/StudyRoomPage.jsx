import React, { useEffect } from "react";
import StudyRoomList from "../../components/StudyRoom/StudyRoomList";
import useBreadcrumbStore from "../../stores/breadcrumbStore";
import styles from "./StudyRoomPage.module.scss";

const StudyRoomPage = () => {
  const setBreadcrumbItems = useBreadcrumbStore((state) => state.setBreadcrumbItems);

  useEffect(() => {
    setBreadcrumbItems([
      { label: "홈", path: "/dashboard" },
      { label: "내 예약 목록", path: "/studyroom/reservation" }
    ]);
  }, [setBreadcrumbItems]);

  return (
    <div className={styles.page}>
      <StudyRoomList />
    </div>
  );
};

export default StudyRoomPage;