import React, { useEffect, useState, useRef } from "react";
import {
  Map as KakaoMap,
  MapMarker,
  CustomOverlayMap,
  Rectangle,
  useKakaoLoader,
} from "react-kakao-maps-sdk";
import styles from "./MapContainer.module.scss";
import CommonButton from "../../common/btn/CommonButton";
import { VscDebugRestart } from "react-icons/vsc";
import selectedMarkerImage from "../../../assets/images/marker/select.png";
import MapBoundaryMarkers from "../develop/MapBoundaryMarkers";
import { useDevMode } from "../../../utils/devModeUtils";

function MapContainer({
  onSearchCurrentMap,
  jobs,
  selectedJob,
  onSelectJob,
  onBoundsChange,
  mapCenter: propMapCenter,
}) {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_API_KEY, // .env 파일의 API 키
    libraries: ["clusterer", "drawing", "services"],
  });

  const [map, setMap] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [isSearchButtonVisible, setIsSearchButtonVisible] = useState(false);
  const [boundaryPoints, setBoundaryPoints] = useState({
    topLeft: null,
    bottomRight: null
  });
  
  // Check if development mode is enabled using the utility hook
  const isDevMode = useDevMode();
  
  // Update mapCenter when propMapCenter changes
  useEffect(() => {
    if (propMapCenter && propMapCenter.lat && propMapCenter.lng) {
      setMapCenter(propMapCenter);
      
      // Trigger bounds update after the map has moved
      if (map) {
        // Use setTimeout to ensure this runs after the map center has been updated
        setTimeout(() => {
          handleBoundsChanged(map);
        }, 300);
      }
    }
  }, [propMapCenter, map]);
  const [currentDistance, setCurrentDistance] = useState(0);
  const isInitialLoad = useRef(true);

  // 지도 중심좌표 이동 로직
  useEffect(() => {
    if (map && mapCenter) {
      map.setCenter(new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng));
    }
  }, [map, mapCenter]);

  // selectedJob이 변경될 때 지도 중심 이동 (필요한 경우에만)
  useEffect(() => {
    if (map && selectedJob && selectedJob.latitude && selectedJob.longitude) {
      // 위도와 경도가 숫자인지 확인
      let lat = parseFloat(selectedJob.latitude);
      let lng = parseFloat(selectedJob.longitude);
      
      // 좌표가 뒤바뀌었는지 확인 (카카오맵은 서울 기준 lat이 약 37, lng이 약 126)
      const mightBeSwapped = (lat > 100 || lat < 30) && (lng > 30 && lng < 40);
      if (mightBeSwapped) {
        [lat, lng] = [lng, lat]; // 좌표 교환
      }
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // 현재 지도 중심 좌표 가져오기
        const currentCenter = map.getCenter();
        const currentLat = currentCenter.getLat();
        const currentLng = currentCenter.getLng();
        
        // 현재 지도 영역(bounds) 가져오기
        const bounds = map.getBounds();
        
        // 선택된 위치가 현재 지도 영역 내에 있는지 확인
        const isWithinBounds = bounds.contain(new window.kakao.maps.LatLng(lat, lng));
        
        // 선택된 위치가 지도 중심에서 얼마나 떨어져 있는지 계산
        const latDiff = Math.abs(currentLat - lat);
        const lngDiff = Math.abs(currentLng - lng);
        
        // 지도 중심에서 일정 거리 이상 떨어져 있거나 지도 영역 밖에 있는 경우에만 중심 이동
        // 위도 0.02 차이는 약 2.2km, 경도 0.02 차이는 서울 기준 약 1.7km
        const THRESHOLD = 0.02;
        
        if (!isWithinBounds || latDiff > THRESHOLD || lngDiff > THRESHOLD) {
          console.log("Moving map to new location:", { lat, lng });
          setMapCenter({ lat, lng });
        } else {
          console.log("Location already near center, not moving map");
        }
      }
    }
  }, [map, selectedJob]);

  // 지도 경계 변경 핸들러
  const handleBoundsChanged = (mapInstance) => {
    if (!mapInstance) return;
    
    const newBounds = mapInstance.getBounds();
    const sw = newBounds.getSouthWest();
    const ne = newBounds.getNorthEast();
    
    // 대각선 거리 계산
    let displayDistance;
    
    // 카카오 geometry 라이브러리가 로드되었는지 확인
    if (window.kakao && window.kakao.maps && window.kakao.maps.geometry) {
      // 카카오 geometry 라이브러리 사용
      const distanceInMeters = window.kakao.maps.geometry.computeDistanceBetween(sw, ne);
      const distanceInKm = distanceInMeters / 1000;
      
      // Update the current distance state
      setCurrentDistance(distanceInKm);
      
      if(distanceInKm >= 30){
        displayDistance = "30km 초과";
      } else {
        displayDistance = `${distanceInKm.toFixed(2)}km`;
      }
    } else {
      // 대체 계산 방법: Haversine 공식을 직접 구현
      const R = 6371; // 지구 반경 (km)
      const dLat = toRad(ne.getLat() - sw.getLat());
      const dLon = toRad(ne.getLng() - sw.getLng());
      const lat1 = toRad(sw.getLat());
      const lat2 = toRad(ne.getLat());
      
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const distanceInKm = R * c;
      
      // Update the current distance state
      setCurrentDistance(distanceInKm);
      
      if (distanceInKm > 25) {
        displayDistance = "25km 초과";
      } else {
        displayDistance = `${distanceInKm.toFixed(2)}km`;
      }
    }
    
    // 지도 영역을 실제 보이는 영역에 맞게 조정하기 위한 축소 계수 (0.1 = 10% 축소)
    const zoomFactor = 0.15;
    
    // 중심점 계산
    const centerLat = (ne.getLat() + sw.getLat()) / 2;
    const centerLng = (ne.getLng() + sw.getLng()) / 2;
    
    // 위도와 경도 범위 계산
    const latRange = ne.getLat() - sw.getLat();
    const lngRange = ne.getLng() - sw.getLng();
    
    // 축소된 범위 계산
    const adjustedNorthLat = centerLat + (latRange / 2) * (1 - zoomFactor);
    const adjustedSouthLat = centerLat - (latRange / 2) * (1 - zoomFactor);
    const adjustedEastLng = centerLng + (lngRange / 2) * (1 - zoomFactor);
    const adjustedWestLng = centerLng - (lngRange / 2) * (1 - zoomFactor);
    
    const boundingBox = {
      northEast: { lat: adjustedNorthLat, lng: adjustedEastLng },
      southWest: { lat: adjustedSouthLat, lng: adjustedWestLng },
      northWest: { lat: adjustedNorthLat, lng: adjustedWestLng },
      southEast: { lat: adjustedSouthLat, lng: adjustedEastLng },
      diagonalDistance: displayDistance,
    };
    
    // Calculate the topLeft and bottomRight points for the API params
    const topLeft = {
      lat: parseFloat(boundingBox.northEast.lat.toFixed(8)),
      lng: parseFloat(boundingBox.southWest.lng.toFixed(8))
    };
    
    const bottomRight = {
      lat: parseFloat(boundingBox.southWest.lat.toFixed(8)),
      lng: parseFloat(boundingBox.northEast.lng.toFixed(8))
    };
    
    // Update the boundary points state
    setBoundaryPoints({
      topLeft: topLeft,
      bottomRight: bottomRight
    });
    
    // Verify the state was updated correctly (will show in next render)
    setTimeout(() => {
      console.log("State after update:", boundaryPoints);
    }, 0);
    
    onBoundsChange(boundingBox);
    if (!isInitialLoad.current) {
      setIsSearchButtonVisible(true);
    }
  };
  
  // 라디안 변환 함수
  const toRad = (value) => {
    return value * Math.PI / 180;
  };

  // 지도 로딩이 완료된 후, 첫 경계를 설정하는 로직
  useEffect(() => {
    if (!map) return;
    setMapInitialized(true);
    handleBoundsChanged(map);
    isInitialLoad.current = false;
  }, [map]);

  const handleSearchButtonClick = async () => {
    // Get the latest bounds before calling 
    if (map) {
      handleBoundsChanged(map);
      
      // Wait a short time to ensure bounds are updated before calling onSearchCurrentMap
      // Promise 기반 접근 방식으로 변경하여 경쟁 조건 방지
      await new Promise(resolve => setTimeout(resolve, 100));
      if (onSearchCurrentMap) {
        onSearchCurrentMap();
      }
    } else {
      // Fallback if map is not available
      if (onSearchCurrentMap) {
        onSearchCurrentMap();
      }
    }
    setIsSearchButtonVisible(false);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error.message}</div>;

  return (
    <div className={styles.mapContainer}>
      {isSearchButtonVisible && (
        <CommonButton
          className={styles.mapSearchButton}
          onClick={handleSearchButtonClick}
        >
          <VscDebugRestart />현 지도에 검색
        </CommonButton>
      )}
      <KakaoMap
        center={mapCenter}
        style={{ width: "100%", height: "100%", position: "relative", zIndex: 1 }}
        level={8}
        onCreate={(map) => {
          setMap(map);
        }}
        onIdle={handleBoundsChanged} // 지도 움직임이 멈췄을 때만 경계를 업데이트합니다.
      >
        {/* Render job markers */}
        {Array.isArray(jobs) && jobs.length > 0 && jobs.map((job, index) => {
          // Make sure latitude and longitude are numeric values and swap them if needed
          // NOTE: Kakao Maps expects lat to be around 37.xx and lng to be around 126.xx for Seoul
          let lat = parseFloat(job.latitude);
          let lng = parseFloat(job.longitude);
          
          // Check if coordinates might be swapped (common error)
          const mightBeSwapped = (lat > 100 || lat < 30) && (lng > 30 && lng < 40);
          if (mightBeSwapped) {
            // Swap lat and lng
            [lat, lng] = [lng, lat];
          }
          
          // if (isNaN(lat) || isNaN(lng)) {
          //   console.warn(`Invalid coordinates for ${job.title || job.companyName}:`, job.latitude, job.longitude);
          //   return null;
          // }
          
          // Check if this job is the selected job
          const isSelected = selectedJob && selectedJob.id === job.id;
          // <a href="https://www.flaticon.com/free-icons/map-pin" title="map pin icons">Map pin icons created by Md Tanvirul Haque - Flaticon</a>
          
          return (
            <React.Fragment key={job.id || `${job.companyName}-${job.title}-${lat}-${lng}`}>
              {/* Marker */}
              <MapMarker
                position={{ lat, lng }}
                onClick={() => onSelectJob(job)}
                image={isSelected ? {
                  // Red marker for selected job
                  src: selectedMarkerImage,
                  size: {
                    width: 24,
                    height: 35
                  },
                } : undefined}
              />
              
              {/* Company name overlay - only show when distance is less than 25km and for max 25 jobs */}
              {currentDistance <= 25 && index < 25 && (
                <CustomOverlayMap
                  position={{ lat, lng }}
                  yAnchor={1.5}
                >
                  <div style={{
                    padding: '3px 8px',
                    backgroundColor: isSelected ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    whiteSpace: 'nowrap'
                  }}>
                    {job.companyName}
                  </div>
                </CustomOverlayMap>
              )}
            </React.Fragment>
          );
        })}
        {/* Development mode boundary markers component */}
        <MapBoundaryMarkers isDevMode={isDevMode} boundaryPoints={boundaryPoints} />
      </KakaoMap>
    </div>
  );
}

export default MapContainer;
