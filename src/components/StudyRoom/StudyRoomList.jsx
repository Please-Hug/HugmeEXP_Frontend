import React, { useState, useEffect } from "react";
import studyRoomReservationService from "../../api/studyRoomReservationService";
import ReservationDetailModal from "./ReservationDetailModal";
import styles from "./StudyRoomList.module.scss";

const StudyRoomList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });
  
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await studyRoomReservationService.user.getUserReservations(pagination.page, pagination.size);
      // API 응답 구조: { message, data: { content, pageable, ... } }
      if (response && response.data) {
        setReservations(response.data.content || []);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.totalPages || 0,
          totalElements: response.data.totalElements || 0
        }));
      }
    } catch (error) {
      setError("예약 목록을 불러오는데 실패했습니다.");
      console.error("예약 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [pagination.page]);

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm("정말로 이 예약을 취소하시겠습니까?")) {
      return;
    }

    try {
      await studyRoomReservationService.user.cancelReservation(reservationId);
      alert("예약이 성공적으로 취소되었습니다.");
      fetchReservations();
    } catch (error) {
      alert("예약 취소에 실패했습니다. 다시 시도해주세요.");
      console.error("예약 취소 실패:", error);
    }
  };

  const handleViewDetail = (reservationId) => {
    setSelectedReservationId(reservationId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedReservationId(null);
  };

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

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(0, pagination.page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages - 1, startPage + maxVisiblePages - 1);

    // 이전 버튼
    if (pagination.page > 0) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(pagination.page - 1)}
          className={styles.pageButton}
        >
          이전
        </button>
      );
    }

    // 페이지 번호
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`${styles.pageButton} ${i === pagination.page ? styles.active : ""}`}
        >
          {i + 1}
        </button>
      );
    }

    // 다음 버튼
    if (pagination.page < pagination.totalPages - 1) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(pagination.page + 1)}
          className={styles.pageButton}
        >
          다음
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>스터디룸 예약 목록</h1>
        <p>총 {pagination.totalElements}개의 예약</p>
      </div>

      {loading && (
        <div className={styles.loading}>로딩 중...</div>
      )}

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div className={styles.noData}>예약 내역이 없습니다.</div>
      )}

      {!loading && !error && reservations.length > 0 && (
        <>
          <div className={styles.reservationList}>
            {reservations.map((reservation) => (
              <div key={reservation.id} className={styles.reservationCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.roomName}>{reservation.studyRoomName}</h3>
                  <span className={styles.location}>{reservation.simpleAddress}</span>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.timeInfo}>
                    <div className={styles.timeRow}>
                      <span className={styles.label}>시작:</span>
                      <span className={styles.time}>{formatDateTime(reservation.reservationStart)}</span>
                    </div>
                    <div className={styles.timeRow}>
                      <span className={styles.label}>종료:</span>
                      <span className={styles.time}>{formatDateTime(reservation.reservationEnd)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.partyInfo}>
                    <span className={styles.partyNum}>{reservation.partyNum}명</span>
                  </div>
                </div>
                
                <div className={styles.cardActions}>
                  <button
                    className={styles.detailButton}
                    onClick={() => handleViewDetail(reservation.id)}
                  >
                    상세보기
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={() => handleCancelReservation(reservation.id)}
                  >
                    예약취소
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              {renderPagination()}
            </div>
          )}
        </>
      )}

      <ReservationDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        reservationId={selectedReservationId}
      />
    </div>
  );
};

export default StudyRoomList;