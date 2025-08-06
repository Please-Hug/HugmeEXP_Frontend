import React from "react";
import styles from "./RecentLearning.module.scss";

function RecentLearning({ onStartLearningClick }) {
  const learningData = {
    title: "(3회차) Spring 기반 백엔드 개발자 성장 과정",
    lastLearning: "출결 QR 코드",
    progress: {
      current: 68,
      total: 107,
    },
  };
  return (
    <div className={styles.learningHeader}>
      <div>
        <h3>{learningData.title}</h3>
        <span>{learningData.lastLearning}</span>
      </div>
      <div>
        <label htmlFor="learning-progress">
          {learningData.progress.current}/{learningData.progress.total}
        </label>
        <progress
          id="learning-progress"
          value={learningData.progress.current}
          max={learningData.progress.total}
        />
      </div>
      <div>
        <button className={styles.learningButton} onClick={onStartLearningClick}>
          학습하기
        </button>
      </div>
    </div>
  );
}

export default RecentLearning;