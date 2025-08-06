import React, { useState, useEffect } from "react";
import { getStudyHallDetail } from "../../api/studyRoomService";
import styles from "./StudyHallDetailModal.module.scss";

function StudyHallDetailModal({ isOpen, onClose, studyHallId }) {
  const [studyHallDetail, setStudyHallDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudyHallDetail = async () => {
    if (!studyHallId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await getStudyHallDetail(studyHallId);
      // API 응답 구조: { message, data }
      console.log("API 응답 전체:", response);
      if (response && response.data) {
        console.log("API 응답 데이터:", response.data);
        console.log("openTime:", response.data.openTime, typeof response.data.openTime);
        console.log("closeTime:", response.data.closeTime, typeof response.data.closeTime);
        setStudyHallDetail(response.data);
      }
    } catch (error) {
      setError("스터디홀 상세 정보를 불러오는데 실패했습니다.");
      console.error("스터디홀 상세 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && studyHallId) {
      fetchStudyHallDetail();
    }
  }, [isOpen, studyHallId]);

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
    
    // 문자열 형태로 온 경우 (HH:mm:ss 형식)
    if (typeof time === 'string' && /^\d{1,2}:\d{2}:\d{2}$/.test(time)) {
      const [hour, minute] = time.split(':');
      return `${hour.padStart(2, '0')}:${minute}`;
    }
    
    // 객체 형태로 온 경우 (LocalTime 객체의 직렬화)
    if (typeof time === 'object' && time !== null) {
      if (time.hour !== undefined && time.minute !== undefined) {
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
      }
    }
    
    console.log("처리되지 않은 시간 형식:", time, typeof time);
    return "정보 없음";
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>스터디홀 상세 정보</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading && (
            <div className={styles.loading}>
              <p>불러오는 중...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          {studyHallDetail && (
            <div className={styles.detailContent}>
              <div className={styles.basicInfo}>
                <h3>{studyHallDetail.name}</h3>
                <div className={styles.infoRow}>
                  <span className={styles.icon}>📍</span>
                  <span>{studyHallDetail.simpleAddress || studyHallDetail.address}</span>
                </div>
                
                {studyHallDetail.address && studyHallDetail.address !== studyHallDetail.simpleAddress && (
                  <div className={styles.infoRow}>
                    <span className={styles.icon}>🗺️</span>
                    <span>{studyHallDetail.address}</span>
                  </div>
                )}
                
                {studyHallDetail.description && (
                  <div className={styles.infoRow}>
                    <span className={styles.icon}>💬</span>
                    <span>{studyHallDetail.description}</span>
                  </div>
                )}

                <div className={styles.infoRow}>
                  <span className={styles.icon}>🕐</span>
                  <span>
                    {formatTime(studyHallDetail.openTime)} - {formatTime(studyHallDetail.closeTime)}
                  </span>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.icon}>🏠</span>
                  <span>총 {studyHallDetail.totalRooms || 0}개 룸</span>
                </div>

                {studyHallDetail.availableRooms !== undefined && (
                  <div className={styles.infoRow}>
                    <span className={styles.icon}>✅</span>
                    <span>이용가능 {studyHallDetail.availableRooms}개</span>
                  </div>
                )}
              </div>

              {studyHallDetail.thumbnail && (
                <div className={styles.thumbnailSection}>
                  <img 
                    src={studyHallDetail.thumbnail} 
                    alt={`${studyHallDetail.name} 썸네일`}
                    className={styles.thumbnail}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudyHallDetailModal;