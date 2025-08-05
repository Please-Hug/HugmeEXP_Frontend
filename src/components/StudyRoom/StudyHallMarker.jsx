import React from "react";
import styles from "./StudyHallMarker.module.scss";

function StudyHallMarker({ studyHall, isSelected, onClick }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(studyHall);
    }
  };

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return null;
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance}km`;
  };

  return (
    <div 
      className={`${styles.studyHallMarker} ${isSelected ? styles.selected : ""}`}
      onClick={handleClick}
    >
      {/* 마커 아이콘 */}
      <div className={styles.markerIcon}>
        <span className={styles.icon}>🏢</span>
        {formatDistance(studyHall.distance) && (
          <div className={styles.distanceBadge}>
            {formatDistance(studyHall.distance)}
          </div>
        )}
      </div>

      {/* 마커 정보 (호버시 표시) */}
      <div className={styles.markerInfo}>
        <div className={styles.infoContent}>
          <h4 className={styles.title}>{studyHall.name}</h4>
          <p className={styles.address}>{studyHall.simpleAddress}</p>
          
          <div className={styles.details}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>🏠</span>
              <span>총 {studyHall.totalRooms || 0}개 룸</span>
            </div>
            
            {studyHall.availableRooms !== undefined && (
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>✅</span>
                <span>이용가능 {studyHall.availableRooms}개</span>
              </div>
            )}
            
            {formatDistance(studyHall.distance) && (
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>📏</span>
                <span>{formatDistance(studyHall.distance)}</span>
              </div>
            )}
          </div>

          {studyHall.description && (
            <p className={styles.description}>{studyHall.description}</p>
          )}

          <div className={styles.actions}>
            <button 
              className={styles.actionBtn}
              onClick={(e) => {
                e.stopPropagation();
                // 상세보기 기능
                alert(`${studyHall.name} 상세보기`);
              }}
            >
              상세보기
            </button>
            <button 
              className={styles.reserveBtn}
              onClick={(e) => {
                e.stopPropagation();
                // 예약하기 기능
                alert(`${studyHall.name} 예약하기`);
              }}
            >
              예약
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudyHallMarker;