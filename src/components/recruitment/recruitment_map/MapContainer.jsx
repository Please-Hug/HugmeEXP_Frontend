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
// Import the marker image
import selectedMarkerImage from "../../../assets/images/marker/select.png";

function MapContainer({
  onSearchCurrentMap,
  jobs,
  selectedJob,
  onSelectJob,
  onBoundsChange,
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
  const [currentDistance, setCurrentDistance] = useState(0);
  const isInitialLoad = useRef(true);

  // 지도 중심좌표 이동 로직
  useEffect(() => {
    if (map && mapCenter) {
      map.setCenter(new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng));
    }
  }, [map, mapCenter]);

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
    
    console.log("Calculated topLeft:", topLeft);
    console.log("Calculated bottomRight:", bottomRight);
    
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
    // console.log("Map initialized:", map);
    setMapInitialized(true);
    handleBoundsChanged(map);
    isInitialLoad.current = false;
  }, [map]);

  const handleSearchButtonClick = () => {
    console.log("topLeft", boundaryPoints.topLeft);
    console.log("bottomRight", boundaryPoints.bottomRight);
    if (onSearchCurrentMap) {
      onSearchCurrentMap();
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
          // console.log("KakaoMap onCreate called", map);
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
          
          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Invalid coordinates for ${job.title || job.companyName}:`, job.latitude, job.longitude);
            return null;
          }
          
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

        {/* {selectedJob && (
          <CustomOverlayMap
            position={{ lat: selectedJob.latitude, lng: selectedJob.longitude }}
          >
            <div className={styles.overlay}>{selectedJob.companyName}</div>
          </CustomOverlayMap>
        )}
         */}
        {/* Display yellow markers for boundary points */}
        {/* Top Left Marker */}
        {boundaryPoints.topLeft && (
          <MapMarker
            key="topLeftMarker"
            position={{
              lat: boundaryPoints.topLeft.lat,
              lng: boundaryPoints.topLeft.lng
            }}
            image={{
              src: "https://t1.daumcdn.net/localimg/localimages/07/2012/img/marker_p.png", 
              size: {
                width: 24,
                height: 35
              },
            }}
          >
            <div style={{ color: '#000', padding: '5px' }}>Top Left</div>
          </MapMarker>
        )}
        
        {/* Bottom Right Marker */}
        {boundaryPoints.bottomRight && (
          <MapMarker
            key="bottomRightMarker"
            position={{
              lat: boundaryPoints.bottomRight.lat,
              lng: boundaryPoints.bottomRight.lng
            }}
            image={{
              src: "https://t1.daumcdn.net/localimg/localimages/07/2012/img/marker_p.png",
              size: {
                width: 24,
                height: 35
              },
            }}
          >
            <div style={{ color: '#000', padding: '5px' }}>Bottom Right</div>
          </MapMarker>
        )}
      </KakaoMap>
    </div>
  );
}

export default MapContainer;
