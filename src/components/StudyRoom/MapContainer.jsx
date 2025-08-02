import { useEffect, useRef, useState } from "react";
import styles from "./MapContainer.module.scss";
import { StudyHallMarkerUtil } from "./StudyHallMarker";

const MapContainer = ({ 
  studyHalls, 
  currentLocation, 
  selectedHall, 
  onHallSelect, 
  onLocationSet,
  loading 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const currentLocationMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const infoWindowRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // 지도 초기화
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error("카카오맵 SDK가 로드되지 않았습니다.");
      return;
    }

    window.kakao.maps.load(() => {
      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 중심
        level: 5, // 확대 레벨
      };

      const map = new window.kakao.maps.Map(container, options);
      mapInstanceRef.current = map;

      // 지도 클릭 이벤트 - 위치 직접 설정
      window.kakao.maps.event.addListener(map, "click", (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        onLocationSet({
          latitude: latlng.getLat(),
          longitude: latlng.getLng(),
        });
      });

      setMapReady(true);
    });
  }, [onLocationSet]);

  // 현재 위치 마커 표시
  useEffect(() => {
    if (!mapReady || !currentLocation || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    // 기존 현재 위치 마커 및 정확도 원 제거
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
    }
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setMap(null);
    }

    // 현재 위치 마커 생성
    const position = new window.kakao.maps.LatLng(
      currentLocation.latitude,
      currentLocation.longitude
    );

    const currentMarker = StudyHallMarkerUtil.createCurrentLocationMarker(map, position, {
      isActive: true
    });
    currentLocationMarkerRef.current = currentMarker;

    // 정확도 원 생성
    if (currentLocation.accuracy) {
      const circle = StudyHallMarkerUtil.createAccuracyCircle(
        map, 
        position, 
        currentLocation.accuracy
      );
      circle.setMap(map);
      accuracyCircleRef.current = circle;
    }

    // 현재 위치로 지도 중심 이동
    map.setCenter(position);
  }, [mapReady, currentLocation]);

  // 스터디홀 마커들 표시
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // 기존 마커들 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 기존 인포윈도우 제거
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // 스터디홀 마커들 생성
    studyHalls.forEach((hall) => {
      if (!hall.latitude || !hall.longitude) return;

      // 선택된 홀인지 확인
      const isSelected = selectedHall && selectedHall.id === hall.id;
      
      // 마커 생성
      const marker = StudyHallMarkerUtil.createStudyHallMarker(map, hall, { isSelected });
      markersRef.current.push(marker);

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, "click", () => {
        onHallSelect(hall);
        
        // 인포윈도우 생성 및 표시
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        const infoWindow = StudyHallMarkerUtil.createInfoWindow(hall, {
          showDetailButton: false
        });
        infoWindow.open(map, marker);
        infoWindowRef.current = infoWindow;

        // 마커 위치로 지도 중심 이동
        const position = new window.kakao.maps.LatLng(hall.latitude, hall.longitude);
        map.setCenter(position);
      });
    });
  }, [mapReady, studyHalls, selectedHall, onHallSelect]);

  // 선택된 홀로 지도 중심 이동
  useEffect(() => {
    if (!mapReady || !selectedHall || !mapInstanceRef.current) return;

    const position = new window.kakao.maps.LatLng(
      selectedHall.latitude,
      selectedHall.longitude
    );
    
    mapInstanceRef.current.setCenter(position);
  }, [mapReady, selectedHall]);

  return (
    <div className={styles.mapContainer}>
      <div ref={mapRef} className={styles.map}></div>
      
      {loading && (
        <div className={styles.mapLoading}>
          <div className={styles.spinner}></div>
        </div>
      )}

      {/* 지도 컨트롤 패널 */}
      <div className={styles.mapControls}>
        <button
          className={styles.controlButton}
          onClick={() => {
            if (currentLocation && mapInstanceRef.current) {
              const position = new window.kakao.maps.LatLng(
                currentLocation.latitude,
                currentLocation.longitude
              );
              mapInstanceRef.current.setCenter(position);
            }
          }}
          disabled={!currentLocation}
          title="내 위치로 이동"
        >
          📍 내 위치
        </button>
        
        <button
          className={styles.controlButton}
          onClick={() => {
            if (mapInstanceRef.current) {
              const level = mapInstanceRef.current.getLevel();
              mapInstanceRef.current.setLevel(Math.max(level - 1, 1));
            }
          }}
          title="지도 확대"
        >
          🔍 확대
        </button>
        
        <button
          className={styles.controlButton}
          onClick={() => {
            if (mapInstanceRef.current) {
              const level = mapInstanceRef.current.getLevel();
              mapInstanceRef.current.setLevel(Math.min(level + 1, 14));
            }
          }}
          title="지도 축소"
        >
          🔍 축소
        </button>

        <button
          className={styles.controlButton}
          onClick={() => {
            if (mapInstanceRef.current && studyHalls.length > 0) {
              // 모든 마커가 보이도록 지도 범위 조정
              const bounds = new window.kakao.maps.LatLngBounds();
              
              studyHalls.forEach(hall => {
                if (hall.latitude && hall.longitude) {
                  bounds.extend(new window.kakao.maps.LatLng(hall.latitude, hall.longitude));
                }
              });

              if (currentLocation) {
                bounds.extend(new window.kakao.maps.LatLng(
                  currentLocation.latitude, 
                  currentLocation.longitude
                ));
              }

              mapInstanceRef.current.setBounds(bounds);
            }
          }}
          disabled={studyHalls.length === 0}
          title="전체 보기"
        >
          🗺️ 전체
        </button>
      </div>
    </div>
  );
};

export default MapContainer;