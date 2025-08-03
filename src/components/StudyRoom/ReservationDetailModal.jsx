import React, { useState, useEffect } from "react";
import Modal from "../common/Modal/Modal";
import { getReservationDetail } from "../../api/studyRoomService";
import styles from "./ReservationDetailModal.module.scss";

const ReservationDetailModal = ({ isOpen, onClose, reservationId }) => {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservationDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getReservationDetail(reservationId);
      setReservation(response.data);
    } catch (error) {
      setError("예약 상세 정보를 불러오는데 실패했습니다.");
      console.error("예약 상세 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && reservationId) {
      fetchReservationDetail();
    }
  }, [isOpen, reservationId]);

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleClose = () => {
    setReservation(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>예약 상세 정보</h2>
        
        {loading && (
          <div className={styles.loading}>로딩 중...</div>
        )}
        
        {error && (
          <div className={styles.error}>{error}</div>
        )}
        
        {reservation && (
          <div className={styles.detailInfo}>
            <div className={styles.infoGroup}>
              <h3>예약 정보</h3>
              <div className={styles.infoRow}>
                <span className={styles.label}>예약 ID:</span>
                <span className={styles.value}>{reservation.id}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>시작 시간:</span>
                <span className={styles.value}>{formatDateTime(reservation.reservationStart)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>종료 시간:</span>
                <span className={styles.value}>{formatDateTime(reservation.reservationEnd)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>예약 인원:</span>
                <span className={styles.value}>{reservation.partyNum}명</span>
              </div>
            </div>

            <div className={styles.infoGroup}>
              <h3>스터디룸 정보</h3>
              <div className={styles.infoRow}>
                <span className={styles.label}>스터디룸:</span>
                <span className={styles.value}>{reservation.studyRoomName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>최대 수용 인원:</span>
                <span className={styles.value}>{reservation.maxNum}명</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>건물명:</span>
                <span className={styles.value}>{reservation.studyHallName}</span>
              </div>
            </div>

            <div className={styles.infoGroup}>
              <h3>위치 정보</h3>
              <div className={styles.infoRow}>
                <span className={styles.label}>간단 주소:</span>
                <span className={styles.value}>{reservation.simpleAddress}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>상세 주소:</span>
                <span className={styles.value}>{reservation.address}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className={styles.buttonGroup}>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
          >
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReservationDetailModal;