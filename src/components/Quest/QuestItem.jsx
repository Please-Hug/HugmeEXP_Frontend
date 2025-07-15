import React from "react";
import styles from "./QuestItem.module.scss";
import inprogressIcon from "../../assets/images/daily-quest/quest-inprogress.png";
import completedIcon from "../../assets/images/daily-quest/quest-success.png";
import apiInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function QuestItem({ title, progress, userQuestId, onCompleted }) {
  const navigate = useNavigate();

  const getStatus = (progress) => {
    switch (progress) {
      case "완료 가능":
        return {
          label: "완료 가능",
          icon: completedIcon,
          isClickable: true,
          color: "#007bff",
        };
      case "완료됨":
        return {
          label: "완료됨",
          icon: completedIcon,
          isClickable: false,
          color: "#007bff",
        };
      default:
        return {
          label: "진행중",
          icon: inprogressIcon,
          isClickable: false,
          color: "#aaa",
        };
    }
  };

  const { label, icon, isClickable, color } = getStatus(progress);

  const handleCompleteQuest = async (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트와 중첩 방지

    if (!isClickable) return;

    await apiInstance.put(`/api/v1/quest/complete/${userQuestId}`);
    alert("퀘스트 완료 처리됨!");
    window.location.reload();
  };

  const handleCardClick = () => {
    let url = "/quest"; // 기본 URL
    if (title.includes("출석")) url = "/dashboard";
    else if (title.includes("미션")) url = "/mission";
    else if (title.includes("일기")) url = "/study-diary";
    else if (title.includes("칭찬")) url = "/praises";

    navigate(url);
  };

  return (
    <div
      className={[styles.questCard, styles.questBox].join(" ")}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.questCardContent}>
        <img src={icon} alt="퀘스트 상태 아이콘" />
        <div className={styles.questDetails}>
          <h6>{title}</h6>
        </div>
      </div>
      <div className={styles.questButtonContainer}>
        <button
          onClick={handleCompleteQuest}
          disabled={!isClickable}
          style={{
            backgroundColor: color,
            color: "white",
            cursor: isClickable ? "pointer" : "default",
          }}
          className={styles.questButton}
        >
          {label}
        </button>
      </div>
    </div>
  );
}

export default QuestItem;
