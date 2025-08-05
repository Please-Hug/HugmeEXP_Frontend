import React from 'react';
import styles from './ProjectOverviewModal.module.scss';
import CommonButton from '../common/btn/CommonButton';

const ProjectOverviewModal = ({ onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Goorm EXP 클론 프로젝트: Please-Hug</h2>
        <hr />
        <h4>🚀 프로젝트 개요</h4>
        <p>
          Please-Hug 프로젝트는 학습 관리 시스템(LMS)인 'Goorm EXP'를
          클론 코딩하여 개발자들의 성장과 협업 경험을 목표로 하는 웹
          애플리케이션입니다.
        </p>
        <h4>🎯 주요 기능</h4>
        <ul>
          <li>미션 및 출석 관리 시스템</li>
          <li>동료 학습을 장려하는 칭찬 및 알림 시스템</li>
          <li>포인트를 활용한 상점 기능</li>
          <li>스터디 카페 좌석 예약 시스템</li>
          <li>채용 정보를 확인할 수 있는 회사 공고 지도</li>
        </ul>
        <div className={styles.closeButton}>
            <CommonButton
              onClick={onClose}
              backgroundColor="#6c757d"
              color="white"
              hoverBackgroundColor="#5a6268"
            >
              닫기
            </CommonButton>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewModal;