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
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [isSearchButtonVisible, setIsSearchButtonVisible] = useState(false);
  const isInitialLoad = useRef(true);

  // 지도 중심좌표 이동 로직
  useEffect(() => {
    if (map && mapCenter) {
      map.setCenter(new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng));
    }
  }, [map, mapCenter]);

  // 지도 경계 변경 핸들러
  const handleBoundsChanged = (mapInstance) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.geometry) return;
    const newBounds = mapInstance.getBounds();
    const sw = newBounds.getSouthWest();
    const ne = newBounds.getNorthEast();

    // 대각선 거리 계산 (Haversine 공식 사용)
    const distanceInMeters = window.kakao.maps.geometry.computeDistanceBetween(sw, ne);
    const distanceInKm = distanceInMeters / 1000;

    let displayDistance;
    if (distanceInKm > 3) {
      displayDistance = "3km 초과";
    } else {
      displayDistance = `${distanceInKm.toFixed(2)}km`;
    }

    const boundingBox = {
      northEast: { lat: ne.getLat(), lng: ne.getLng() },
      southWest: { lat: sw.getLat(), lng: sw.getLng() },
      northWest: { lat: ne.getLat(), lng: sw.getLng() },
      southEast: { lat: sw.getLat(), lng: ne.getLng() },
      diagonalDistance: displayDistance,
    };
    onBoundsChange(boundingBox);
    if (!isInitialLoad.current) {
      setIsSearchButtonVisible(true);
    }
  };

  // 지도 로딩이 완료된 후, 첫 경계를 설정하는 로직
  useEffect(() => {
    if (!map) return;
    handleBoundsChanged(map);
    isInitialLoad.current = false;
  }, [map]);

  const handleSearchButtonClick = () => {
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
        style={{ width: "100%", height: "100%" }}
        level={8}
        onCreate={setMap} // onCreate에서는 map 객체만 설정합니다.
        onIdle={handleBoundsChanged} // 지도 움직임이 멈췄을 때만 경계를 업데이트합니다.
      >
        {Array.isArray(jobs) && jobs.map((job) => (
          <MapMarker
            key={job.id || `${job.companyName}-${job.title}-${job.latitude}-${job.longitude}`}
            position={{ lat: job.latitude, lng: job.longitude }}
            onClick={() => onSelectJob(job)}
          />
        ))}

        {selectedJob && (
          <CustomOverlayMap
            position={{ lat: selectedJob.latitude, lng: selectedJob.longitude }}
          >
            <div className={styles.overlay}>{selectedJob.companyName}</div>
          </CustomOverlayMap>
        )}
      </KakaoMap>
    </div>
  );
}

export default MapContainer;
