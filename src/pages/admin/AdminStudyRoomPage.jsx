import React, { useState, useEffect } from "react";
import studyRoomService from "../../api/studyRoomService";
import StudyHallModal from "../../components/admin/StudyHallModal";
import StudyRoomModal from "../../components/admin/StudyRoomModal";
import styles from "./AdminStudyRoomPage.module.scss";

function AdminStudyRoomPage() {
  const [studyHalls, setStudyHalls] = useState([]);
  const [selectedStudyHall, setSelectedStudyHall] = useState(null);
  const [studyRooms, setStudyRooms] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showStudyHallModal, setShowStudyHallModal] = useState(false);
  const [showStudyRoomModal, setShowStudyRoomModal] = useState(false);
  const [editingStudyHall, setEditingStudyHall] = useState(null);
  const [editingStudyRoom, setEditingStudyRoom] = useState(null);

  // 메시지 스타일 클래스 가져오기
  const getMessageClass = () => {
    if (message.startsWith("✅")) return `${styles.message} ${styles.success}`;
    if (message.startsWith("❌")) return `${styles.message} ${styles.error}`;
    if (message.startsWith("⚠️")) return `${styles.message} ${styles.warning}`;
    return styles.message;
  };

  // 운영시간 포맷팅 함수
  const formatOperatingHours = (openTime, closeTime) => {
    const formatTime = (timeValue) => {
      if (!timeValue) return "정보 없음";
      
      // 숫자나 문자열을 시간 형태로 변환
      const timeString = timeValue.toString().trim();
      
      // 정규식으로 시간과 분 추출 (다양한 형태 지원)
      // 11:,4, 11:04, 11.04, 1104, 11,04 등 모든 형태 지원
      const timePattern = /(\d{1,2})[\s:.,]*(\d{1,2})?/;
      const match = timeString.match(timePattern);
      
      if (match) {
        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        
        // 시간과 분이 유효한 범위인지 확인
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
      
      // 긴 숫자 형태 (예: 9010483000000, 22010483000000)에서 시간 추출
      if (timeString.length > 10) {
        const hourMatch = timeString.match(/^(\d{1,2})/);
        if (hourMatch) {
          const hour = parseInt(hourMatch[1]);
          if (hour >= 0 && hour <= 23) {
            return `${hour.toString().padStart(2, '0')}:00`;
          }
        }
      }
      
      // 4자리 숫자 형태 (예: 0900, 2200, 1104)
      if (timeString.length === 4 && /^\d{4}$/.test(timeString)) {
        const hours = parseInt(timeString.substring(0, 2));
        const minutes = parseInt(timeString.substring(2, 4));
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
      
      // 3자리 숫자 형태 (예: 900, 104)
      if (timeString.length === 3 && /^\d{3}$/.test(timeString)) {
        const hours = parseInt(timeString.substring(0, 1));
        const minutes = parseInt(timeString.substring(1, 3));
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
      
      // 1-2자리 숫자 형태 (시간만)
      if (/^\d{1,2}$/.test(timeString)) {
        const hour = parseInt(timeString);
        if (hour >= 0 && hour <= 23) {
          return `${hour.toString().padStart(2, '0')}:00`;
        }
      }
      
      return "시간 오류";
    };

    const formattedOpen = formatTime(openTime);
    const formattedClose = formatTime(closeTime);
    
    return `${formattedOpen} ~ ${formattedClose}`;
  };

  // 스터디홀 목록 조회
  const fetchStudyHalls = async () => {
    setLoading(true);
    try {
      const response = await studyRoomService.studyHall.getStudyHalls(page, 20);
      setStudyHalls(response.content);
      setTotalPages(response.totalPages);
      setMessage("✅ 스터디홀 목록을 불러왔습니다.");
    } catch (error) {
      console.error("스터디홀 조회 오류:", error);
      if (error.response?.status === 403) {
        setMessage("❌ 관리자 권한이 필요합니다.");
      } else {
        setMessage("❌ 스터디홀 목록을 불러오는데 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 스터디룸 목록 조회
  const fetchStudyRooms = async (studyHallId) => {
    try {
      const response = await studyRoomService.studyRoom.getStudyRooms(studyHallId);
      setStudyRooms(response);
      setMessage("✅ 스터디룸 목록을 불러왔습니다.");
    } catch (error) {
      console.error("스터디룸 조회 오류:", error);
      if (error.response?.status === 404) {
        setMessage("❌ 스터디홀을 찾을 수 없습니다.");
      } else if (error.response?.status === 403) {
        setMessage("❌ 관리자 권한이 필요합니다.");
      } else {
        setMessage("❌ 스터디룸 목록을 불러오는데 실패했습니다.");
      }
    }
  };

  // 스터디홀 선택
  const handleSelectStudyHall = (studyHall) => {
    setSelectedStudyHall(studyHall);
    fetchStudyRooms(studyHall.id);
  };

  // 스터디홀 삭제
  const handleDeleteStudyHall = async (studyHallId) => {
    if (!window.confirm("정말로 이 스터디홀을 삭제하시겠습니까?")) return;

    try {
      await studyRoomService.studyHall.deleteStudyHall(studyHallId);
      setMessage("✅ 스터디홀이 삭제되었습니다.");
      fetchStudyHalls();
      if (selectedStudyHall?.id === studyHallId) {
        setSelectedStudyHall(null);
        setStudyRooms([]);
      }
    } catch (error) {
      console.error("스터디홀 삭제 오류:", error);
      if (error.response?.status === 404) {
        setMessage("❌ 스터디홀을 찾을 수 없습니다.");
      } else if (error.response?.status === 403) {
        setMessage("❌ 관리자 권한이 필요합니다.");
      } else {
        setMessage("❌ 스터디홀 삭제에 실패했습니다.");
      }
    }
  };

  // 스터디룸 삭제
  const handleDeleteStudyRoom = async (roomId) => {
    if (!selectedStudyHall) return;
    if (!window.confirm("정말로 이 스터디룸을 삭제하시겠습니까?")) return;

    try {
      await studyRoomService.studyRoom.deleteStudyRoom(selectedStudyHall.id, roomId);
      setMessage("✅ 스터디룸이 삭제되었습니다.");
      fetchStudyRooms(selectedStudyHall.id);
    } catch (error) {
      console.error("스터디룸 삭제 오류:", error);
      if (error.response?.status === 404) {
        setMessage("❌ 스터디홀 또는 스터디룸을 찾을 수 없습니다.");
      } else if (error.response?.status === 403) {
        setMessage("❌ 관리자 권한이 필요합니다.");
      } else {
        setMessage("❌ 스터디룸 삭제에 실패했습니다.");
      }
    }
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    fetchStudyHalls();
  }, [page]);

  return (
    <div className={styles.AdminStudyRoomPage}>
      <h2 className={styles.title}>스터디룸 관리</h2>
      <div className={styles.content}>
        {/* 스터디홀 섹션 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>스터디홀 목록</h3>
            <button
              className={styles.primaryButton}
              onClick={() => {
                setEditingStudyHall(null);
                setShowStudyHallModal(true);
              }}
            >
              스터디홀 추가
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>로딩 중...</div>
          ) : studyHalls.length === 0 ? (
            <div className={styles.empty}>등록된 스터디홀이 없습니다.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>이름</th>
                    <th>간단 주소</th>
                    <th>운영 시간</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {studyHalls.map((hall) => (
                    <tr
                      key={hall.id}
                      className={selectedStudyHall?.id === hall.id ? styles.selected : ""}
                      onClick={() => handleSelectStudyHall(hall)}
                    >
                      <td>{hall.id}</td>
                      <td>{hall.name}</td>
                      <td>{hall.simpleAddress}</td>
                      <td>
                        {formatOperatingHours(hall.openTime, hall.closeTime)}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.editButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStudyHall(hall);
                              setShowStudyHallModal(true);
                            }}
                          >
                            수정
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStudyHall(hall.id);
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
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
            </div>
          )}
        </div>

        {/* 스터디룸 섹션 */}
        {selectedStudyHall && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{selectedStudyHall.name}의 스터디룸</h3>
              <button
                className={styles.primaryButton}
                onClick={() => {
                  setEditingStudyRoom(null);
                  setShowStudyRoomModal(true);
                }}
              >
                스터디룸 추가
              </button>
            </div>

            {studyRooms.length === 0 ? (
              <div className={styles.empty}>등록된 스터디룸이 없습니다.</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>이름</th>
                      <th>최대 인원</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studyRooms.map((room) => (
                      <tr key={room.id}>
                        <td>{room.id}</td>
                        <td>{room.name}</td>
                        <td>{room.maxNum}명</td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              className={styles.editButton}
                              onClick={() => {
                                setEditingStudyRoom(room);
                                setShowStudyRoomModal(true);
                              }}
                            >
                              수정
                            </button>
                            <button
                              className={styles.deleteButton}
                              onClick={() => handleDeleteStudyRoom(room.id)}
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 메시지 표시 */}
        {message && <div className={getMessageClass()}>{message}</div>}
      </div>

      {/* 스터디홀 모달 */}
      {showStudyHallModal && (
        <StudyHallModal
          isOpen={showStudyHallModal}
          onClose={() => {
            setShowStudyHallModal(false);
            setEditingStudyHall(null);
          }}
          studyHall={editingStudyHall}
          onSuccess={fetchStudyHalls}
        />
      )}

      {/* 스터디룸 모달 */}
      {showStudyRoomModal && selectedStudyHall && (
        <StudyRoomModal
          isOpen={showStudyRoomModal}
          onClose={() => {
            setShowStudyRoomModal(false);
            setEditingStudyRoom(null);
          }}
          studyHallId={selectedStudyHall.id}
          studyRoom={editingStudyRoom}
          onSuccess={() => fetchStudyRooms(selectedStudyHall.id)}
        />
      )}
    </div>
  );
}

export default AdminStudyRoomPage;