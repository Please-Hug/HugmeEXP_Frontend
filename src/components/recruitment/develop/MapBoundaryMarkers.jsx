import React from "react";
import { MapMarker } from "react-kakao-maps-sdk";

/**
 * 개발 모드에서만 표시되는 경계점 마커 컴포넌트
 * 개발 모드일 때만 보임
 * 
 * @param {Object} props
 * @param {Object} props.boundaryPoints - 표시할 경계점 좌표
 * @param {boolean} [props.isDevMode] - 개발 모드 여부
 */
function MapBoundaryMarkers({ isDevMode, boundaryPoints }) {
  // 제공된 isDevMode prop을 사용
  
  if (!isDevMode) return null;

  return (
    <>
      {/* 왼쪽 상단 마커 */}
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
      
      {/* 오른쪽 하단 마커 */}
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
    </>
  );
}

export default MapBoundaryMarkers;
