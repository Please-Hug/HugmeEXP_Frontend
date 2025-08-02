import { useState, useEffect } from "react";
import styles from "./StudyRoomMap.module.scss";
import MapContainer from "../../components/StudyRoom/MapContainer";
import LocationSearch from "../../components/StudyRoom/LocationSearch";
import StudyHallList from "../../components/StudyRoom/StudyHallList";
import { 
  getAllStudyHallsForMap, 
  searchNearbyStudyHalls,
  getCurrentLocation,
  checkLocationAccuracy
} from "../../api/studyRoomService";

const StudyRoomMap = () => {
  // 상태 관리
  const [studyHalls, setStudyHalls] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedHall, setSelectedHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10); // 기본 10km
  const [searchMode, setSearchMode] = useState("all"); // "all" | "nearby"

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    initializeMap();
  }, []);

  // 지도 초기화
  const initializeMap = async () => {
    try {
      setLoading(true);
      setError(null);

      // 모든 스터디홀 데이터 먼저 로드
      await loadAllStudyHalls();

      // 현재 위치 시도 (실패해도 계속 진행)
      try {
        await loadCurrentLocation();
      } catch (locationError) {
        console.warn("현재 위치 로드 실패:", locationError.message);
        // 위치 로드 실패는 에러로 처리하지 않음
      }

    } catch (err) {
      console.error("지도 초기화 실패:", err);
      setError("지도를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 모든 스터디홀 데이터 로드
  const loadAllStudyHalls = async () => {
    try {
      const response = await getAllStudyHallsForMap();
      setStudyHalls(response.data || []);
      setSearchMode("all");
    } catch (err) {
      throw new Error("스터디홀 데이터를 불러올 수 없습니다.");
    }
  };

  // 현재 위치 로드
  const loadCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      const accuracyInfo = checkLocationAccuracy(location.accuracy);
      
      setCurrentLocation({
        ...location,
        accuracyInfo
      });

      console.log("현재 위치 로드 완료:", location);
      
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // 주변 스터디홀 검색
  const searchNearby = async (customLocation = null) => {
    const location = customLocation || currentLocation;
    
    if (!location) {
      setError("현재 위치를 먼저 설정해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await searchNearbyStudyHalls({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: searchRadius,
        limit: 50
      });

      setStudyHalls(response.data || []);
      setSearchMode("nearby");
      
    } catch (err) {
      console.error("주변 검색 실패:", err);
      setError("주변 스터디홀 검색에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 현재 위치 버튼 클릭
  const handleCurrentLocationClick = async () => {
    try {
      setLoading(true);
      await loadCurrentLocation();
      await searchNearby();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // 검색 반경 변경
  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    if (searchMode === "nearby" && currentLocation) {
      searchNearby();
    }
  };

  // 스터디홀 선택
  const handleHallSelect = (hall) => {
    setSelectedHall(hall);
  };

  // 위치 직접 설정 (지도 클릭 또는 주소 검색)
  const handleLocationSet = (location) => {
    setCurrentLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: 0, // 직접 설정한 위치는 정확함
      accuracyInfo: { level: "high", message: "직접 설정한 위치입니다.", color: "blue" }
    });
  };

  return (
    <div className={styles.studyRoomMap}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h1>스터디룸 찾기</h1>
        <p>내 주변의 스터디룸을 찾아보세요</p>
      </div>

      {/* 메인 컨텐츠 */}
      <div className={styles.content}>
        {/* 왼쪽 사이드바 */}
        <div className={styles.sidebar}>
          {/* 검색 컨트롤 */}
          <LocationSearch
            currentLocation={currentLocation}
            searchRadius={searchRadius}
            onCurrentLocationClick={handleCurrentLocationClick}
            onRadiusChange={handleRadiusChange}
            onLocationSet={handleLocationSet}
            onSearchNearby={searchNearby}
            onLoadAll={loadAllStudyHalls}
            loading={loading}
          />

          {/* 스터디홀 목록 */}
          <StudyHallList
            studyHalls={studyHalls}
            currentLocation={currentLocation}
            selectedHall={selectedHall}
            onHallSelect={handleHallSelect}
            searchMode={searchMode}
            loading={loading}
          />
        </div>

        {/* 오른쪽 지도 영역 */}
        <div className={styles.mapArea}>
          {error && (
            <div className={styles.errorMessage}>
              <p>⚠️ {error}</p>
              <button onClick={initializeMap}>다시 시도</button>
            </div>
          )}
          
          <MapContainer
            studyHalls={studyHalls}
            currentLocation={currentLocation}
            selectedHall={selectedHall}
            onHallSelect={handleHallSelect}
            onLocationSet={handleLocationSet}
            loading={loading}
          />
        </div>
      </div>

      {/* 로딩 오버레이 */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>지도를 불러오는 중...</p>
        </div>
      )}
    </div>
  );
};

export default StudyRoomMap;