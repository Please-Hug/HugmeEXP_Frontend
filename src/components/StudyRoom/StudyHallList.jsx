import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudyHallDetailModal from "./StudyHallDetailModal";
import styles from "./StudyHallList.module.scss";

function StudyHallList({ studyHalls, selectedStudyHall, onStudyHallSelect, loading, error }) {
  const navigate = useNavigate();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudyHallId, setSelectedStudyHallId] = useState(null);
  
  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return null;
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance}km`;
  };

  const formatTime = (time) => {
    if (!time) return "정보 없음";
    
    // 이미 HH:mm 형식인 경우
    if (typeof time === 'string' && time.includes(':')) {
      return time;
    }
    
    // 콤마로 구분된 형식인 경우 (11,4 -> 11:04)
    if (typeof time === 'string' && time.includes(',')) {
      const [hour, minute] = time.split(',').map(num => parseInt(num.trim()));
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    // LocalTime은 배열 형태 [hour, minute, second, nanosecond] 또는 문자열로 올 수 있음
    if (Array.isArray(time)) {
      // LocalTime이 배열로 온 경우: [hour, minute, second, nanosecond]
      const [hour, minute] = time;
      if (typeof hour === 'number' && typeof minute === 'number') {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
    }
    
    // 문자열 형태로 온 경우
    if (typeof time === 'string') {
      // "HH:mm:ss" 형식이면 초 제거
      if (/^\d{1,2}:\d{2}:\d{2}$/.test(time)) {
        const [hour, minute] = time.split(':');
        return `${hour.padStart(2, '0')}:${minute}`;
      }
    }
    
    // 객체 형태로 온 경우 (LocalTime 객체의 직렬화)
    if (typeof time === 'object' && time !== null) {
      if (time.hour !== undefined && time.minute !== undefined) {
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
      }
    }
    
    return "정보 없음";
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
                      setSelectedStudyHallId(studyHall.id);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    상세보기
                  </button>
                  
                  <button 
                    className={styles.reserveBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/studyroom/reservation/${studyHall.id}`);
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

      <StudyHallDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStudyHallId(null);
        }}
        studyHallId={selectedStudyHallId}
      />
    </div>
  );
}

export default StudyHallList;