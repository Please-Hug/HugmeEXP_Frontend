import React from "react";
import styles from "./StudyHallList.module.scss";

function StudyHallList({ studyHalls, selectedStudyHall, onStudyHallSelect, loading, error }) {
  
  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return null;
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance}km`;
  };

  const formatTime = (time) => {
    if (!time) return "정보 없음";
    const date = new Date(time);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (loading) {
    return (
      <div className={styles.studyHallList}>
        <div className={styles.listHeader}>
          <h3>스터디홀 목록</h3>
        </div>
        <div className={styles.loading}>
          <p>불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.studyHallList}>
        <div className={styles.listHeader}>
          <h3>스터디홀 목록</h3>
        </div>
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.studyHallList}>
      <div className={styles.listHeader}>
        <h3>스터디홀 목록</h3>
        <span className={styles.count}>총 {studyHalls.length}개</span>
      </div>

      <div className={styles.listContainer}>
        {studyHalls.length === 0 ? (
          <div className={styles.empty}>
            <p>검색 결과가 없습니다.</p>
            <span>다른 검색어나 조건으로 시도해보세요.</span>
          </div>
        ) : (
          <div className={styles.list}>
            {studyHalls.map((studyHall) => (
              <div
                key={studyHall.id}
                className={`${styles.listItem} ${
                  selectedStudyHall && selectedStudyHall.id === studyHall.id 
                    ? styles.selected 
                    : ""
                }`}
                onClick={() => onStudyHallSelect && onStudyHallSelect(studyHall)}
              >
                <div className={styles.itemHeader}>
                  <h4 className={styles.itemTitle}>{studyHall.name}</h4>
                  {formatDistance(studyHall.distance) && (
                    <span className={styles.distance}>
                      {formatDistance(studyHall.distance)}
                    </span>
                  )}
                </div>

                <div className={styles.itemContent}>
                  <div className={styles.address}>
                    <span className={styles.icon}>📍</span>
                    <span>{studyHall.simpleAddress || studyHall.address}</span>
                  </div>

                  {studyHall.description && (
                    <div className={styles.description}>
                      <span className={styles.icon}>💬</span>
                      <span>{studyHall.description}</span>
                    </div>
                  )}

                  <div className={styles.details}>
                    <div className={styles.detailItem}>
                      <span className={styles.icon}>🏠</span>
                      <span>총 {studyHall.totalRooms || 0}개 룸</span>
                    </div>

                    {studyHall.availableRooms !== undefined && (
                      <div className={styles.detailItem}>
                        <span className={styles.icon}>✅</span>
                        <span>이용가능 {studyHall.availableRooms}개</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.operatingHours}>
                    <span className={styles.icon}>🕐</span>
                    <span>
                      {formatTime(studyHall.openTime)} - {formatTime(studyHall.closeTime)}
                    </span>
                  </div>
                </div>

                <div className={styles.itemActions}>
                  <button 
                    className={styles.detailBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      // 상세보기 기능 추가 가능
                      onStudyHallSelect && onStudyHallSelect(studyHall);
                    }}
                  >
                    상세보기
                  </button>
                  
                  <button 
                    className={styles.reserveBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      // 예약하기 기능 추가 가능
                      alert(`${studyHall.name} 예약 기능은 준비 중입니다.`);
                    }}
                  >
                    예약하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyHallList;