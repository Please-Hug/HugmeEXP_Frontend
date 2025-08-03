import React, { useEffect } from "react";
import StudyRoomList from "../../components/StudyRoom/StudyRoomList";
import useBreadcrumbStore from "../../stores/breadcrumbStore";
import styles from "./StudyRoomPage.module.scss";

const StudyRoomPage = () => {
  const setBreadcrumbItems = useBreadcrumbStore((state) => state.setBreadcrumbItems);

  useEffect(() => {
    setBreadcrumbItems([
      { label: "홈", path: "/dashboard" },
      { label: "스터디룸 예약", path: "/studyroom/reservation" }
    ]);
  }, [setBreadcrumbItems]);

  return (
    <div className={styles.page}>
      <StudyRoomList />
    </div>
  );
};

export default StudyRoomPage;