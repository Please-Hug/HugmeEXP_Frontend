import React, { useState, useEffect } from "react";
import studyRoomService from "../../api/studyRoomService";
import studyRoomReservationService from "../../api/studyRoomReservationService";
import styles from "./StudyRoomReservationPage.module.scss";

function StudyRoomReservationPage() {
  const [studyRooms, setStudyRooms] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [reservationForm, setReservationForm] = useState({
    startDate: "",
    startTime: "",
    duration: 1,
    partyNum: 1
  });

  // 스터디룸 목록 조회
  const fetchStudyRooms = async () => {
    setLoading(true);
    try {
      const response = await studyRoomService.getAllStudyRooms();
      setStudyRooms(response.data || []);
    } catch (error) {
      console.error("스터디룸 조회 오류:", error);
      setMessage("❌ 스터디룸 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 내 예약 목록 조회
  const fetchMyReservations = async () => {
    try {
      const response = await studyRoomReservationService.user.getUserReservations();
      setMyReservations(response.data.content || []);
    } catch (error) {
      console.error("예약 조회 오류:", error);
    }
  };

  // 예약하기
  const handleReservation = async () => {
    if (!selectedRoom) {
      setMessage("⚠️ 스터디룸을 선택해주세요.");
      return;
    }

    if (!reservationForm.startDate || !reservationForm.startTime) {
      setMessage("⚠️ 예약 날짜와 시간을 입력해주세요.");
      return;
    }

    const reservationStart = `${reservationForm.startDate}T${reservationForm.startTime}:00`;
    const startDateTime = new Date(reservationStart);
    const endDateTime = new Date(startDateTime.getTime() + reservationForm.duration * 60 * 60 * 1000);
    const reservationEnd = endDateTime.toISOString().slice(0, 19);

    try {
      const payload = {
        studyRoomId: selectedRoom.id,
        reservationStart,
        reservationEnd,
        partyNum: reservationForm.partyNum
      };

      const response = await studyRoomReservationService.user.createReservation(payload);
      setMessage("✅ 예약이 완료되었습니다!");
      fetchMyReservations();
      setReservationForm({
        startDate: "",
        startTime: "",
        duration: 1,
        partyNum: 1
      });
    } catch (error) {
      console.error("예약 오류:", error);
      setMessage(error.response?.data?.message || "❌ 예약에 실패했습니다.");
    }
  };

  // 예약 취소
  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm("정말로 예약을 취소하시겠습니까?")) return;

    try {
      await studyRoomReservationService.user.cancelReservation(reservationId);
      setMessage("✅ 예약이 취소되었습니다.");
      fetchMyReservations();
    } catch (error) {
      console.error("예약 취소 오류:", error);
      setMessage("❌ 예약 취소에 실패했습니다.");
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
    fetchStudyRooms();
    fetchMyReservations();
  }, []);

  return (
    <div className={styles.StudyRoomReservationPage}>
      <h1 className={styles.title}>스터디룸 예약</h1>

      <div className={styles.content}>
        {/* 스터디룸 선택 섹션 */}
        <div className={styles.section}>
          <h2>스터디룸 선택</h2>
          {loading ? (
            <div className={styles.loading}>로딩 중...</div>
          ) : (
            <div className={styles.roomGrid}>
              {studyRooms.map((room) => (
                <div
                  key={room.id}
                  className={`${styles.roomCard} ${selectedRoom?.id === room.id ? styles.selected : ""}`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <h3>{room.name}</h3>
                  <p className={styles.location}>{room.simpleAddress}</p>
                  <p className={styles.capacity}>최대 {room.maxCapacity}명</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 예약 정보 입력 섹션 */}
        {selectedRoom && (
          <div className={styles.section}>
            <h2>예약 정보 입력</h2>
            <div className={styles.reservationForm}>
              <div className={styles.formGroup}>
                <label>예약 날짜</label>
                <input
                  type="date"
                  value={reservationForm.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setReservationForm({...reservationForm, startDate: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>시작 시간</label>
                <input
                  type="time"
                  value={reservationForm.startTime}
                  onChange={(e) => setReservationForm({...reservationForm, startTime: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>이용 시간</label>
                <select
                  value={reservationForm.duration}
                  onChange={(e) => setReservationForm({...reservationForm, duration: Number(e.target.value)})}
                >
                  <option value={1}>1시간</option>
                  <option value={2}>2시간</option>
                  <option value={3}>3시간</option>
                  <option value={4}>4시간</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>인원 수</label>
                <input
                  type="number"
                  min="1"
                  max={selectedRoom.maxCapacity}
                  value={reservationForm.partyNum}
                  onChange={(e) => setReservationForm({...reservationForm, partyNum: Number(e.target.value)})}
                />
              </div>
              <button className={styles.submitButton} onClick={handleReservation}>
                예약하기
              </button>
            </div>
          </div>
        )}

        {/* 내 예약 목록 섹션 */}
        <div className={styles.section}>
          <h2>내 예약 목록</h2>
          {myReservations.length === 0 ? (
            <p className={styles.empty}>예약이 없습니다.</p>
          ) : (
            <div className={styles.reservationList}>
              {myReservations.map((reservation) => {
                const { status, className } = getReservationStatus(reservation);
                return (
                  <div key={reservation.id} className={styles.reservationCard}>
                    <div className={styles.reservationHeader}>
                      <h3>{reservation.studyRoomName}</h3>
                      <span className={`${styles.status} ${className}`}>{status}</span>
                    </div>
                    <p className={styles.location}>{reservation.simpleAddress}</p>
                    <p className={styles.time}>
                      {formatDateTime(reservation.reservationStart)} ~ {formatDateTime(reservation.reservationEnd)}
                    </p>
                    <p className={styles.people}>예약 인원: {reservation.partyNum}명</p>
                    {status === "예정" && (
                      <button
                        className={styles.cancelButton}
                        onClick={() => handleCancelReservation(reservation.id)}
                      >
                        예약 취소
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 메시지 표시 */}
        {message && (
          <div className={`${styles.message} ${
            message.startsWith("✅") ? styles.success : 
            message.startsWith("❌") ? styles.error : 
            styles.warning
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyRoomReservationPage;