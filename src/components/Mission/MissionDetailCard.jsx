import React, { useState, useEffect } from "react";
import styles from "./MissionDetailCard.module.scss";
import missionStateMap from "../../utils/missionStateMap";
import missionDifficultyMap from "../../utils/missionDifficultyMap";
import TaskItem from "./TaskItem";
import { FaClipboardQuestion, FaFlag } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import MissionTask from "./MissionTask";
import AddTaskModal from "./AddTaskModal";
import useTokenPayload from "../../stores/tokenPayloadStore";

function MissionDetailCard({ mission, groupName, progress, onChallenge }) {
  const navigate = useNavigate();
  const [tipOpen, setTipOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);
  const tokenPayload = useTokenPayload((state) => state.tokenPayload);
  useEffect(() => {
    setTipOpen(false);
  }, [mission]);

  const handleTipClick = () => {
    setTipOpen(!tipOpen);
  };

  return (
    <div className={styles.missionDetail}>
      {mission && (
        <>
          <h4 className={styles.missionDetailTitle}>
            Lv.{mission.order} {groupName}
          </h4>
          <div className={styles.missionDetailContent}>
            <h2 className={styles.missionDetailName}>{mission.name}</h2>
            <ul className={styles.missionDetailInfo}>
              <li>
                <span className={styles.missionDetailLabel}>진행상태</span>
                <span
                  className={[
                    styles.missionDetailProgressValue,
                    progress ? styles[progress] : "",
                  ].join(" ")}
                >
                  {progress ? missionStateMap[progress] : "도전 가능"}
                </span>
              </li>
              <li>
                <span className={styles.missionDetailLabel}>난이도</span>
                <span
                  className={[
                    styles.missionDetailDifficulty,
                    styles[mission.difficulty],
                  ].join(" ")}
                >
                  <FaFlag /> {missionDifficultyMap[mission.difficulty]}
                </span>
              </li>
            </ul>
            <p className={styles.missionDetailReward}>
              <span className={styles.missionDetailRewardLabel}>
                획득 가능한 리워드
              </span>
              <span className={styles.missionDetailRewardValue}>
                구름 조각 <strong>{mission.rewardPoint}</strong>개 · 경험치{" "}
                <strong>{mission.rewardExp}</strong>개
              </span>
            </p>
            <div className={styles.missionDetailDescription}>
              {mission.description}
              {mission.tip && (
                <span
                  className={styles.missionTipIcon}
                  onClick={handleTipClick}
                >
                  <FaClipboardQuestion />
                </span>
              )}
              {tipOpen && (
                <div className={styles.missionTip}>
                  <h4>Hint</h4>
                  <p>{mission.tip || "이 미션에 대한 팁이 없습니다."}</p>
                </div>
              )}
            </div>
            <div className={styles.missionDetailSubtasksTitleContainer}>
              <h3 className={styles.missionDetailSubtasksTitle}>하위 태스크</h3>
              {tokenPayload?.role === "ROLE_ADMIN" && (
                <button
                  className={styles.addTaskButton}
                  onClick={() => setIsAddTaskModalOpen(true)}
                >
                  추가
                </button>
              )}
            </div>
            <MissionTask missionId={mission.id} reloadFlag={reloadFlag} />
          </div>
          <div className={styles.missionDetailActions}>
            {!progress ? (
              <span
                className={styles.missionDetailChallengeButton}
                onClick={() => {
                  onChallenge(mission.id);
                }}
              >
                미션 도전하기
              </span>
            ) : (
              <button
                className={styles.missionDetailMoveButton}
                onClick={() => {
                  navigate(`/mission/${mission.id}`);
                }}
              >
                학습 계획 이동하기
              </button>
            )}
          </div>
        </>
      )}
      {isAddTaskModalOpen && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => {
            setReloadFlag(reloadFlag + 1);
            setIsAddTaskModalOpen(false);
          }}
          missionId={mission.id}
        />
      )}
    </div>
  );
}

export default MissionDetailCard;
