import { useState, useEffect } from "react";
import styles from "./StudyHallList.module.scss";

const StudyHallList = ({
  studyHalls,
  currentLocation,
  selectedHall,
  onHallSelect,
  searchMode,
  loading
}) => {
  const [sortBy, setSortBy] = useState("distance"); // "distance" | "name" | "availability"
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "available" | "full"
  const [sortedHalls, setSortedHalls] = useState([]);

  // 스터디홀 정렬 및 필터링
  useEffect(() => {
    let filtered = [...studyHalls];

    // 필터링
    if (filterStatus === "available") {
      filtered = filtered.filter(hall => {
        const available = hall.availableRooms || 0;
        return available > 0;
      });
    } else if (filterStatus === "full") {
      filtered = filtered.filter(hall => {
        const available = hall.availableRooms || 0;
        return available === 0;
      });
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          if (!a.distance && !b.distance) return 0;
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        
        case "name":
          return a.name.localeCompare(b.name);
        
        case "availability":
          const aAvailable = a.availableRooms || 0;
          const bAvailable = b.availableRooms || 0;
          return bAvailable - aAvailable;
        
        default:
          return 0;
      }
    });

    setSortedHalls(filtered);
  }, [studyHalls, sortBy, filterStatus]);

  // 운영 상태 체크
  const getOperatingStatus = (openTime, closeTime) => {
    if (!openTime || !closeTime) return { status: "unknown", text: "운영시간 미정" };

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const open = new Date(openTime);
    const close = new Date(closeTime);
    const openTime24 = open.getHours() * 100 + open.getMinutes();
    const closeTime24 = close.getHours() * 100 + close.getMinutes();

    if (currentTime >= openTime24 && currentTime <= closeTime24) {
      return { status: "open", text: "운영중" };
    } else {
      return { status: "closed", text: "영업종료" };
    }
  };

  // 거리 표시 포맷팅
  const formatDistance = (distance) => {
    if (!distance) return null;
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // 운영시간 포맷팅
  const formatOperatingHours = (openTime, closeTime) => {
    if (!openTime || !closeTime) return "운영시간 미정";
    
    const formatTime = (timeStr) => {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    return `${formatTime(openTime)} - ${formatTime(closeTime)}`;
  };

  return (
    <div className={styles.studyHallList}>
      {/* 헤더 */}
      <div className={styles.listHeader}>
        <div className={styles.resultInfo}>
          <h3>
            {searchMode === "nearby" ? "주변 스터디홀" : "스터디홀 목록"}
            <span className={styles.count}>({sortedHalls.length}개)</span>
          </h3>
        </div>

        {/* 정렬 및 필터 컨트롤 */}
        <div className={styles.controls}>
          <div className={styles.sortControl}>
            <label htmlFor="sort">정렬:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.select}
            >
              <option value="distance">거리순</option>
              <option value="name">이름순</option>
              <option value="availability">이용가능순</option>
            </select>
          </div>

          <div className={styles.filterControl}>
            <label htmlFor="filter">필터:</label>
            <select
              id="filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.select}
            >
              <option value="all">전체</option>
              <option value="available">이용가능</option>
              <option value="full">만실</option>
            </select>
          </div>
        </div>
      </div>

      {/* 목록 */}
      <div className={styles.listContent}>
        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>스터디홀을 불러오는 중...</p>
          </div>
        )}

        {!loading && sortedHalls.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏢</div>
            <h4>스터디홀이 없습니다</h4>
            <p>
              {searchMode === "nearby" 
                ? "검색 반경을 넓혀보시거나 다른 위치에서 검색해보세요."
                : "다른 검색 조건을 시도해보세요."
              }
            </p>
          </div>
        )}

        {!loading && sortedHalls.map((hall) => {
          const isSelected = selectedHall && selectedHall.id === hall.id;
          const operatingStatus = getOperatingStatus(hall.openTime, hall.closeTime);
          const availableRooms = hall.availableRooms || 0;
          const totalRooms = hall.totalRooms || 0;

          return (
            <div
              key={hall.id}
              className={`${styles.hallCard} ${isSelected ? styles.selected : ""}`}
              onClick={() => onHallSelect(hall)}
            >
              {/* 썸네일 */}
              <div className={styles.thumbnail}>
                {hall.thumbnail ? (
                  <img src={hall.thumbnail} alt={hall.name} />
                ) : (
                  <div className={styles.defaultThumbnail}>
                    <span>🏢</span>
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div className={styles.hallInfo}>
                <div className={styles.hallHeader}>
                  <h4 className={styles.hallName}>{hall.name}</h4>
                  {hall.distance && (
                    <span className={styles.distance}>
                      📍 {formatDistance(hall.distance)}
                    </span>
                  )}
                </div>

                <div className={styles.hallDetails}>
                  <div className={styles.address}>
                    📍 {hall.simpleAddress || hall.address}
                  </div>
                  
                  <div className={styles.operatingInfo}>
                    <span className={`${styles.operatingStatus} ${styles[operatingStatus.status]}`}>
                      {operatingStatus.text}
                    </span>
                    <span className={styles.operatingHours}>
                      🕒 {formatOperatingHours(hall.openTime, hall.closeTime)}
                    </span>
                  </div>

                  <div className={styles.roomInfo}>
                    <span className={styles.roomAvailability}>
                      🪑 이용가능: {availableRooms}/{totalRooms}
                    </span>
                    <div className={`${styles.availabilityBar} ${availableRooms === 0 ? styles.full : ""}`}>
                      <div 
                        className={styles.availabilityFill}
                        style={{ 
                          width: totalRooms > 0 ? `${(availableRooms / totalRooms) * 100}%` : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {hall.description && (
                  <p className={styles.description}>{hall.description}</p>
                )}
              </div>

              {/* 선택 표시 */}
              {isSelected && (
                <div className={styles.selectedIndicator}>
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudyHallList;