import React from "react";
import {
  Map as KakaoMap,
  MapMarker,
  CustomOverlayMap,
  useKakaoLoader,
} from "react-kakao-maps-sdk";
import styles from "./MapContainer.module.scss";

function MapContainer({ jobs, selectedJob, onSelectJob, mapCenter }) {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_API_KEY, // .env 파일의 API 키
    libraries: ["clusterer", "drawing", "services"],
  });

  const [map, setMap] = React.useState(null);

  React.useEffect(() => {
    if (map && mapCenter) {
      map.setCenter(new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng));
    }
  }, [map, mapCenter]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error}</div>;

  return (
    <div className={styles.mapContainer}>
      <KakaoMap
        center={mapCenter}
        style={{ width: "100%", height: "100%" }}
        level={8}
        onCreate={setMap}
      >
        {jobs.map((job) => (
          <MapMarker
            key={`${job.title}-${job.lat}`}
            position={{ lat: job.lat, lng: job.lng }} // 마커를 표시할 위치
            onClick={() => onSelectJob(job)} // 마커에 클릭 이벤트 등록
          />
        ))}

        {selectedJob && (
          <CustomOverlayMap
            position={{ lat: selectedJob.lat, lng: selectedJob.lng }}
          >
            <div className={styles.overlay}>{selectedJob.company}</div>
          </CustomOverlayMap>
        )}
      </KakaoMap>
    </div>
  );
}

export default MapContainer;
