import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import studyRoomService, { getStudyHallDetail, getStudyRoomsByHall } from "../../api/studyRoomService";
import studyRoomReservationService from "../../api/studyRoomReservationService";
import useBreadcrumbStore from "../../stores/breadcrumbStore";
import styles from "./StudyRoomReservationPage.module.scss";

function StudyRoomReservationPage() {
  const { studyHallId } = useParams();
  const setBreadcrumbItems = useBreadcrumbStore((state) => state.setBreadcrumbItems);
  const [studyHall, setStudyHall] = useState(null);
  const [studyRooms, setStudyRooms] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [reservationForm, setReservationForm] = useState({
    startDate: "",
    startTime: "",
    endTime: "",
    partyNum: 1
  });

  // 시간 포맷팅 함수 (11,4 -> 11:04 형식으로 변환)
  const formatTime = (timeString) => {
    if (!timeString) return "정보 없음";
    
    // 이미 HH:mm 형식인 경우
    if (typeof timeString === 'string' && timeString.includes(':')) {
      return timeString;
    }
    
    // 콤마로 구분된 형식인 경우 (11,4 -> 11:04)
    if (typeof timeString === 'string' && timeString.includes(',')) {
      const [hour, minute] = timeString.split(',').map(num => parseInt(num.trim()));
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    // 배열 형식인 경우
    if (Array.isArray(timeString)) {
      const [hour, minute] = timeString;
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    // 객체 형식인 경우
    if (typeof timeString === 'object' && timeString.hour !== undefined && timeString.minute !== undefined) {
      return `${timeString.hour.toString().padStart(2, '0')}:${timeString.minute.toString().padStart(2, '0')}`;
    }
    
    return timeString.toString();
  };

  // 30분 단위 시간 옵션 생성 함수
  const generateTimeOptions = (startHour = 9, endHour = 22) => {
    const options = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push({ value: timeString, label: displayTime });
      }
    }
    return options;
  };

  // 스터디홀 운영시간 기반 시간 옵션 생성
  const getAvailableTimeOptions = () => {
    if (studyHall && studyHall.openTime && studyHall.closeTime) {
      // 운영시간 파싱
      const openTime = formatTime(studyHall.openTime);
      const closeTime = formatTime(studyHall.closeTime);
      
      const openHour = parseInt(openTime.split(':')[0]);
      const closeHour = parseInt(closeTime.split(':')[0]);
      
      return generateTimeOptions(openHour, closeHour);
    }
    // 기본값: 9시~22시
    return generateTimeOptions(9, 22);
  };

  // 선택된 시작시간 이후 종료시간 옵션 필터링
  const getEndTimeOptions = () => {
    if (!reservationForm.startTime) return [];
    
    const allOptions = getAvailableTimeOptions();
    const startTime = reservationForm.startTime;
    
    // 시작시간보다 늦은 시간만 필터링 (최소 30분 이후)
    return allOptions.filter(option => {
      const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const optionMinutes = parseInt(option.value.split(':')[0]) * 60 + parseInt(option.value.split(':')[1]);
      return optionMinutes > startMinutes;
    });
  };

  // 예상 이용시간 계산
  const calculateDuration = () => {
    if (!reservationForm.startTime || !reservationForm.endTime) return "";
    
    const startMinutes = parseInt(reservationForm.startTime.split(':')[0]) * 60 + parseInt(reservationForm.startTime.split(':')[1]);
    const endMinutes = parseInt(reservationForm.endTime.split(':')[0]) * 60 + parseInt(reservationForm.endTime.split(':')[1]);
    const durationMinutes = endMinutes - startMinutes;
    
    if (durationMinutes <= 0) return "";
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours === 0) return `${minutes}분`;
    if (minutes === 0) return `${hours}시간`;
    return `${hours}시간 ${minutes}분`;
  };

  // 스터디홀 상세 정보 및 스터디룸 목록 조회
  const fetchStudyHallAndRooms = async () => {
    setError(null);
    setMessage("");
    
    if (!studyHallId) {
      // studyHallId가 없는 경우: 스터디홀을 선택하지 않은 상태
      setError("스터디홀을 선택해주세요.");
      setMessage("❌ 먼저 지도에서 스터디홀을 선택해주세요.");
      setStudyRooms([]);
      return;
    }

    setLoading(true);
    try {
      // 스터디홀 상세 정보 조회
      const studyHallResponse = await getStudyHallDetail(studyHallId);
      
      // API 응답 구조: { message, data }
      if (studyHallResponse && studyHallResponse.data) {
        setStudyHall(studyHallResponse.data);
      }
      
      // 스터디홀 상세 응답에는 studyRooms가 포함되지 않으므로 별도 API 호출
      const roomsResponse = await getStudyRoomsByHall(studyHallId);
      
      // API 응답 구조: { message, data }
      if (roomsResponse && roomsResponse.data) {
        setStudyRooms(roomsResponse.data);
      } else {
        setStudyRooms([]);
      }
    } catch (error) {
      console.error("스터디홀/스터디룸 조회 오류:", error);
      setError(`스터디홀 정보를 불러오는데 실패했습니다: ${error.message}`);
      setMessage(`❌ 스터디룸 목록을 불러오는데 실패했습니다: ${error.message}`);
      
      // 네트워크 오류일 경우 추가 안내
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError("네트워크 연결을 확인해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 내 예약 목록 조회
  const fetchMyReservations = async () => {
    try {
      const response = await studyRoomReservationService.user.getUserReservations();
      // API 응답 구조: { message, data: { content, pageable, ... } }
      if (response && response.data && response.data.content) {
        setMyReservations(response.data.content);
      } else {
        setMyReservations([]);
      }
    } catch (error) {
      console.error("예약 조회 오류:", error);
      setMyReservations([]);
    }
  };

  // 예약하기
  const handleReservation = async () => {
    if (!selectedRoom) {
      setMessage("⚠️ 스터디룸을 선택해주세요.");
      return;
    }

    if (!reservationForm.startDate || !reservationForm.startTime || !reservationForm.endTime) {
      setMessage("⚠️ 예약 날짜, 시작 시간, 종료 시간을 모두 입력해주세요.");
      return;
    }

    // 시간 유효성 검증
    const startTime = reservationForm.startTime;
    const endTime = reservationForm.endTime;
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    
    if (endMinutes <= startMinutes) {
      setMessage("⚠️ 종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    const reservationStart = `${reservationForm.startDate}T${reservationForm.startTime}:00`;
    const reservationEnd = `${reservationForm.startDate}T${reservationForm.endTime}:00`;

    try {
      const payload = {
        studyRoomId: selectedRoom.id,
        reservationStart,
        reservationEnd,
        partyNum: reservationForm.partyNum
      };

      const response = await studyRoomReservationService.user.createReservation(payload);
      // API 응답 구조: { message, data: { reservationId } }
      setMessage("✅ 예약이 완료되었습니다!");
      fetchMyReservations();
      setReservationForm({
        startDate: "",
        startTime: "",
        endTime: "",
        partyNum: 1
      });
    } catch (error) {
      console.error("예약 오류:", error);
      // 에러 응답도 { message, data, status, timestamp } 형식
      const errorMessage = error.response?.data?.message || "❌ 예약에 실패했습니다.";
      setMessage(errorMessage);
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
    if (!dateTimeString) {
      return "정보 없음";
    }

    let date;
    
    // 문자열인 경우
    if (typeof dateTimeString === 'string') {
      // ISO 8601 형식 (2024-01-01T10:30:00)
      date = new Date(dateTimeString);
    } 
    // 배열인 경우 [year, month, day, hour, minute, second]
    else if (Array.isArray(dateTimeString)) {
      const [year, month, day, hour, minute, second] = dateTimeString;
      date = new Date(year, month - 1, day, hour, minute, second || 0);
    }
    // 객체인 경우
    else if (typeof dateTimeString === 'object') {
      if (dateTimeString.year && dateTimeString.month && dateTimeString.day) {
        date = new Date(
          dateTimeString.year,
          dateTimeString.month - 1,
          dateTimeString.day,
          dateTimeString.hour || 0,
          dateTimeString.minute || 0,
          dateTimeString.second || 0
        );
      } else {
        date = new Date(dateTimeString);
      }
    }
    else {
      date = new Date(dateTimeString);
    }

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      return "유효하지 않은 날짜";
    }

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
    
    // 시작시간과 종료시간을 안전하게 파싱
    let start, end;
    
    try {
      if (typeof reservation.reservationStart === 'string') {
        start = new Date(reservation.reservationStart);
      } else if (Array.isArray(reservation.reservationStart)) {
        const [year, month, day, hour, minute, second] = reservation.reservationStart;
        start = new Date(year, month - 1, day, hour, minute, second || 0);
      } else {
        start = new Date(reservation.reservationStart);
      }

      if (typeof reservation.reservationEnd === 'string') {
        end = new Date(reservation.reservationEnd);
      } else if (Array.isArray(reservation.reservationEnd)) {
        const [year, month, day, hour, minute, second] = reservation.reservationEnd;
        end = new Date(year, month - 1, day, hour, minute, second || 0);
      } else {
        end = new Date(reservation.reservationEnd);
      }
    } catch (error) {
      console.error("예약 시간 파싱 오류:", error);
      return { status: "알 수 없음", className: styles.unknown };
    }

    // 유효한 날짜인지 확인
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { status: "알 수 없음", className: styles.unknown };
    }

    if (now < start) {
      return { status: "예정", className: styles.scheduled };
    } else if (now >= start && now <= end) {
      return { status: "진행중", className: styles.inProgress };
    } else {
      return { status: "완료", className: styles.completed };
    }
  };

  useEffect(() => {
    fetchStudyHallAndRooms();
    fetchMyReservations();
  }, [studyHallId]);

  useEffect(() => {
    if (studyHall && studyHallId) {
      setBreadcrumbItems([
        { label: "홈", path: "/dashboard" },
        { label: "스터디룸 지도", path: "/studyroom" },
        { label: `${studyHall.name} 예약`, path: `/studyroom/reservation/${studyHallId}` }
      ]);
    } else if (studyHallId) {
      setBreadcrumbItems([
        { label: "홈", path: "/dashboard" },
        { label: "스터디룸 지도", path: "/studyroom" },
        { label: "스터디룸 예약", path: `/studyroom/reservation/${studyHallId}` }
      ]);
    } else {
      setBreadcrumbItems([
        { label: "홈", path: "/dashboard" },
        { label: "스터디룸 예약", path: "/studyroom/reservation" }
      ]);
    }
  }, [studyHall, studyHallId, setBreadcrumbItems]);

  return (
    <div className={styles.StudyRoomReservationPage}>
      <h1 className={styles.title}>
        {studyHall ? `${studyHall.name} - 스터디룸 예약` : "스터디룸 예약"}
      </h1>

      {studyHall && (
        <div className={styles.studyHallInfo}>
          <div className={styles.infoRow}>
            <span className={styles.icon}>📍</span>
            <span>{studyHall.simpleAddress || studyHall.address}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.icon}>🕐</span>
            <span>
              {studyHall.openTime && studyHall.closeTime ? 
                `${formatTime(studyHall.openTime)} - ${formatTime(studyHall.closeTime)}` : "정보 없음"
              }
            </span>
          </div>
        </div>
      )}

      <div className={styles.content}>
        {/* 오류 메시지 섹션 */}
        {error && (
          <div className={styles.errorSection}>
            <div className={styles.error}>
              <h3>⚠️ 오류가 발생했습니다</h3>
              <p>{error}</p>
              <button 
                className={styles.retryButton}
                onClick={() => fetchStudyHallAndRooms()}
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 스터디룸 선택 섹션 */}
        <div className={styles.section}>
          <h2>{studyHall ? `${studyHall.name} 스터디룸 선택` : "스터디룸 선택"}</h2>
          {loading ? (
            <div className={styles.loading}>
              <p>스터디룸 정보를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className={styles.errorPlaceholder}>
              <p>스터디룸 정보를 불러올 수 없습니다.</p>
            </div>
          ) : studyRooms.length === 0 ? (
            <div className={styles.empty}>
              <p>사용 가능한 스터디룸이 없습니다.</p>
              {studyHallId && <p>다른 스터디홀을 선택해보세요.</p>}
            </div>
          ) : (
            <div className={styles.roomGrid}>
              {studyRooms.map((room) => (
                <div
                  key={room.id}
                  className={`${styles.roomCard} ${selectedRoom?.id === room.id ? styles.selected : ""}`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <h3>{room.name}</h3>
                  <p className={styles.location}>{room.simpleAddress || studyHall?.simpleAddress}</p>
                  <p className={styles.capacity}>최대 {room.maxNum}명</p>
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
                <select
                  value={reservationForm.startTime}
                  onChange={(e) => {
                    setReservationForm({
                      ...reservationForm, 
                      startTime: e.target.value,
                      endTime: "" // 시작시간 변경 시 종료시간 초기화
                    });
                  }}
                >
                  <option value="">시작 시간 선택</option>
                  {getAvailableTimeOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>종료 시간</label>
                <select
                  value={reservationForm.endTime}
                  onChange={(e) => setReservationForm({...reservationForm, endTime: e.target.value})}
                  disabled={!reservationForm.startTime}
                >
                  <option value="">종료 시간 선택</option>
                  {getEndTimeOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {!reservationForm.startTime && (
                  <small className={styles.helpText}>먼저 시작 시간을 선택해주세요</small>
                )}
              </div>
              {calculateDuration() && (
                <div className={styles.formGroup}>
                  <label>예상 이용시간</label>
                  <div className={styles.durationDisplay}>
                    {calculateDuration()}
                  </div>
                </div>
              )}
              <div className={styles.formGroup}>
                <label>인원 수</label>
                <input
                  type="number"
                  min="1"
                  max={selectedRoom.maxNum}
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
                      <h3>{reservation.studyRoomName || "스터디룸 정보 없음"}</h3>
                      <span className={`${styles.status} ${className}`}>{status}</span>
                    </div>
                    <p className={styles.location}>{reservation.simpleAddress || "주소 정보 없음"}</p>
                    <p className={styles.time}>
                      {formatDateTime(reservation.reservationStart)} ~ {formatDateTime(reservation.reservationEnd)}
                    </p>
                    <p className={styles.people}>예약 인원: {reservation.partyNum || 0}명</p>
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