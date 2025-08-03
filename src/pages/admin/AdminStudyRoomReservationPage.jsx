import React, { useState, useEffect } from "react";
import studyRoomReservationService from "../../api/studyRoomReservationService";
import styles from "./AdminStudyRoomReservationPage.module.scss";

function AdminStudyRoomReservationPage() {
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // 메시지 스타일 클래스 가져오기
  const getMessageClass = () => {
    if (message.startsWith("✅")) return `${styles.message} ${styles.success}`;
    if (message.startsWith("❌")) return `${styles.message} ${styles.error}`;
    if (message.startsWith("⚠️")) return `${styles.message} ${styles.warning}`;
    return styles.message;
  };

  // 예약 목록 조회
  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await studyRoomReservationService.admin.getAllReservations(page, 20);
      setReservations(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      setMessage(response.message || "✅ 예약 목록을 불러왔습니다.");
    } catch (error) {
      console.error("예약 조회 오류:", error);
      setMessage("❌ 예약 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 예약 취소
  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm("정말로 이 예약을 취소하시겠습니까?")) return;

    try {
      const response = await studyRoomReservationService.admin.forceDeleteReservation(reservationId);
      setMessage(response.message || "✅ 예약이 취소되었습니다.");
      fetchReservations();
      setSelectedReservation(null);
    } catch (error) {
      console.error("예약 취소 오류:", error);
      setMessage("❌ 예약 취소에 실패했습니다.");
    }
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  // 날짜 포맷팅
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 예약 시간 계산
  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = endTime - startTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}시간 ${minutes}분`;
  };

  // 예약 상태 확인
  const getReservationStatus = (reservation) => {
    const now = new Date();
    const start = new Date(reservation.reservationStart);
    const end = new Date(reservation.reservationEnd);

    if (now < start) {
      return { status: "예정", className: styles.scheduled };
    } else if (now >= start && now <= end) {
      return { status: "진행중", className: styles.inProgress };
    } else {
      return { status: "완료", className: styles.completed };
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [page]);

  return (
    <div className={styles.AdminStudyRoomReservationPage}>
      <h2 className={styles.title}>스터디룸 예약 관리</h2>
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>예약 목록</h3>
            <div className={styles.info}>
              총 {totalElements}개의 예약
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>로딩 중...</div>
          ) : reservations.length === 0 ? (
            <div className={styles.empty}>예약이 없습니다.</div>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>스터디룸</th>
                      <th>위치</th>
                      <th>예약 시간</th>
                      <th>인원</th>
                      <th>상태</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation) => {
                      const { status, className } = getReservationStatus(reservation);
                      return (
                        <tr
                          key={reservation.id}
                          className={selectedReservation?.id === reservation.id ? styles.selected : ""}
                          onClick={() => setSelectedReservation(reservation)}
                        >
                          <td>{reservation.id}</td>
                          <td>{reservation.studyRoomName}</td>
                          <td>{reservation.simpleAddress}</td>
                          <td>
                            <div className={styles.timeInfo}>
                              <div>{formatDateTime(reservation.reservationStart)}</div>
                              <div className={styles.duration}>
                                ~ {formatDateTime(reservation.reservationEnd)}
                              </div>
                              <div className={styles.durationText}>
                                ({calculateDuration(reservation.reservationStart, reservation.reservationEnd)})
                              </div>
                            </div>
                          </td>
                          <td>{reservation.partyNum}명</td>
                          <td>
                            <span className={`${styles.status} ${className}`}>{status}</span>
                          </td>
                          <td>
                            <button
                              className={styles.cancelButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelReservation(reservation.id);
                              }}
                            >
                              취소
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={page === 0}
                  >
                    처음
                  </button>
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                  >
                    이전
                  </button>
                  <span>
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}
                  >
                    다음
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={page === totalPages - 1}
                  >
                    마지막
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 선택된 예약 상세 정보 */}
        {selectedReservation && (
          <div className={styles.card}>
            <h3>예약 상세 정보</h3>
            <div className={styles.detailContent}>
              <div className={styles.detailRow}>
                <span className={styles.label}>예약 ID:</span>
                <span>{selectedReservation.id}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>스터디룸:</span>
                <span>{selectedReservation.studyRoomName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>위치:</span>
                <span>{selectedReservation.simpleAddress}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>시작 시간:</span>
                <span>{formatDateTime(selectedReservation.reservationStart)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>종료 시간:</span>
                <span>{formatDateTime(selectedReservation.reservationEnd)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>예약 인원:</span>
                <span>{selectedReservation.partyNum}명</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>상태:</span>
                <span className={`${styles.status} ${getReservationStatus(selectedReservation).className}`}>
                  {getReservationStatus(selectedReservation).status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 메시지 표시 */}
        {message && <div className={getMessageClass()}>{message}</div>}
      </div>
    </div>
  );
}

export default AdminStudyRoomReservationPage;