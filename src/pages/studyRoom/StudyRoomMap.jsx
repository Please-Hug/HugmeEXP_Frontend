import React, { useEffect, useState } from "react";
import styles from "./StudyRoomMap.module.scss";
import MapContainer from "../../components/StudyRoom/MapContainer";
import LocationSearch from "../../components/StudyRoom/LocationSearch";
import StudyHallList from "../../components/StudyRoom/StudyHallList";
import { getAllStudyHallsForMap, searchNearbyStudyHalls } from "../../api/studyRoomService";
import useBreadcrumbStore from "../../stores/breadcrumbStore";

function StudyRoomMap() {
  const [studyHalls, setStudyHalls] = useState([]);
  const [selectedStudyHall, setSelectedStudyHall] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.9780 }); // 서울 시청 기본값
  const { setBreadcrumbItems } = useBreadcrumbStore();

  useEffect(() => {
    setBreadcrumbItems([
      { label: "홈", path: "/dashboard" },
      { label: "스터디룸 지도", path: "/studyroom" },
    ]);
  }, [setBreadcrumbItems]);

  // 현재 위치 가져오기
  useEffect(() => {
    // 먼저 모든 스터디홀을 로드
    loadAllStudyHalls();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          setMapCenter(location);
          
          // 현재 위치 기반으로 주변 스터디홀 검색 (선택사항)
          // handleNearbySearch(location.lat, location.lng);
        },
        (error) => {
          console.warn("현재 위치를 가져올 수 없습니다:", error);
          // 현재 위치를 가져올 수 없는 경우에도 모든 스터디홀은 이미 로드됨
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000, // 10분간 캐시
        }
      );
    } else {
      console.warn("위치 서비스가 지원되지 않습니다.");
      // 위치 서비스가 없어도 모든 스터디홀은 이미 로드됨
    }
  }, []);

  // 모든 스터디홀 로드
  const loadAllStudyHalls = async () => {
    try {
      setLoading(true);
      const response = await getAllStudyHallsForMap();
      setStudyHalls(response.data || []);
    } catch (error) {
      console.error("스터디홀 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 주변 스터디홀 검색
  const handleNearbySearch = async (lat, lng, radius = 10.0) => {
    try {
      setLoading(true);
      const response = await searchNearbyStudyHalls(lat, lng, radius);
      console.log('주변 검색 응답:', response);
      
      // 응답 구조 확인: { message: "...", data: [...] }
      const studyHallsData = response.data || response || [];
      console.log('주변 검색 데이터:', studyHallsData);
      
      // 데이터 전처리
      const processedData = studyHallsData.map(hall => ({
        ...hall,
        openTime: Array.isArray(hall.openTime) 
          ? `${hall.openTime[3]}:${String(hall.openTime[4]).padStart(2, '0')}`
          : hall.openTime,
        closeTime: Array.isArray(hall.closeTime) 
          ? `${hall.closeTime[3]}:${String(hall.closeTime[4]).padStart(2, '0')}`
          : hall.closeTime
      }));
      
      setStudyHalls(processedData);
      
      if (processedData.length === 0) {
        setError(`반경 ${radius}km 내에 스터디홀이 없습니다.`);
      }
    } catch (error) {
      console.error("주변 스터디홀 검색 실패:", error);
      setError("주변 스터디홀을 검색하는데 실패했습니다: " + error.message);
      // 실패시 모든 스터디홀 로드
      loadAllStudyHalls();
    } finally {
      setLoading(false);
    }
  };

  // 검색 결과 처리
  const handleSearchResults = (results, center) => {
    setStudyHalls(results);
    if (center) {
      setMapCenter(center);
    }
  };

  // 스터디홀 선택 처리
  const handleStudyHallSelect = (studyHall) => {
    setSelectedStudyHall(studyHall);
    setMapCenter({ lat: studyHall.latitude, lng: studyHall.longitude });
  };

  // 지도 중심 변경 처리
  const handleMapCenterChange = (center) => {
    setMapCenter(center);
  };

  if (loading && studyHalls.length === 0) {
    return (
      <div className={styles.studyRoomMap}>
        <div className={styles.loading}>
          <p>스터디홀 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.studyRoomMap}>
      <div className={styles.mapHeader}>
        <h2>스터디룸 지도</h2>
        <p>가까운 스터디홀을 찾아보세요</p>
      </div>
      
      <LocationSearch 
        onSearchResults={handleSearchResults}
        onNearbySearch={handleNearbySearch}
        currentLocation={currentLocation}
        className={styles.locationSearch}
      />

      <div className={styles.mapContent}>
        <div className={styles.mapContainer}>
          <MapContainer
            studyHalls={studyHalls}
            selectedStudyHall={selectedStudyHall}
            currentLocation={currentLocation}
            center={mapCenter}
            onStudyHallSelect={handleStudyHallSelect}
            onCenterChange={handleMapCenterChange}
          />
        </div>
        
        <div className={styles.sidePanel}>
          <StudyHallList
            studyHalls={studyHalls}
            selectedStudyHall={selectedStudyHall}
            onStudyHallSelect={handleStudyHallSelect}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

export default StudyRoomMap;