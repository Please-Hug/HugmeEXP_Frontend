import React from "react";
import {
  Map,
  MapMarker,
  CustomOverlayMap,
  useKakaoLoader,
} from "react-kakao-maps-sdk";
import styles from "./MapContainer.module.scss";

function MapContainer({ jobs, selectedJob, onSelectJob }) {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_API_KEY, // .env 파일의 API 키
    libraries: ["clusterer", "drawing", "services"],
  });

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error}</div>;

  return (
    <div className={styles.mapContainer}>
      <Map // 지도를 표시할 Container
        center={{ lat: 37.504897, lng: 127.049611 }} // 지도의 중심좌표
        style={{ width: "100%", height: "100%" }} // 지도 크기
        level={8} // 지도 확대 레벨
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
      </Map>
    </div>
  );
}

export default MapContainer;
