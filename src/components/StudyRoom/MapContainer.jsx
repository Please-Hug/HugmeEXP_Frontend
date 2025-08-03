import React, { useEffect, useRef, useState } from "react";
import styles from "./MapContainer.module.scss";

function MapContainer({ 
  studyHalls = [], 
  selectedStudyHall, 
  currentLocation,
  center,
  onStudyHallSelect,
  onCenterChange 
}) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

  // 카카오맵 SDK 동적 로드
  useEffect(() => {
    const loadKakaoMapScript = () => {
      return new Promise((resolve, reject) => {
        // 이미 로드되어 있는지 확인
        if (window.kakao && window.kakao.maps) {
          console.log('카카오맵 SDK 이미 로드됨');
          resolve();
          return;
        }

        // 환경변수에서 API 키 가져오기
        const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY;
        
        if (!KAKAO_API_KEY) {
          reject(new Error('카카오맵 API 키가 설정되지 않았습니다'));
          return;
        }

        console.log('카카오맵 SDK 로드 시작...', KAKAO_API_KEY);

        const script = document.createElement('script');
        script.async = true;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false`;
        
        script.onload = () => {
          console.log('카카오맵 스크립트 로드 완료');
          // kakao.maps.load로 초기화 대기
          if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
              console.log('카카오맵 초기화 완료');
              resolve();
            });
          } else {
            reject(new Error('카카오맵 객체를 찾을 수 없습니다'));
          }
        };

        script.onerror = () => {
          reject(new Error('카카오맵 스크립트 로드 실패'));
        };

        document.head.appendChild(script);
      });
    };

    loadKakaoMapScript()
      .then(() => {
        console.log('✅ 카카오맵 로드 성공');
        setIsKakaoLoaded(true);
      })
      .catch((error) => {
        console.error('❌ 카카오맵 로드 실패:', error);
      });
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isKakaoLoaded || !mapRef.current) return;

    try {
      console.log('지도 초기화 시작...');
      
      const mapOptions = {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: 8
      };

      const kakaoMap = new window.kakao.maps.Map(mapRef.current, mapOptions);
      setMap(kakaoMap);
      console.log('✅ 지도 생성 성공!');

      // 지도 중심 변경 이벤트
      if (onCenterChange) {
        window.kakao.maps.event.addListener(kakaoMap, 'center_changed', () => {
          const centerPosition = kakaoMap.getCenter();
          onCenterChange({
            lat: centerPosition.getLat(),
            lng: centerPosition.getLng()
          });
        });
      }

    } catch (error) {
      console.error('지도 생성 실패:', error);
    }
  }, [isKakaoLoaded, center, onCenterChange]);

  // 현재 위치 마커
  useEffect(() => {
    if (!map || !currentLocation) return;

    console.log('현재 위치 마커 추가:', currentLocation);
    
    const currentPos = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
    const currentMarker = new window.kakao.maps.Marker({
      position: currentPos,
      title: '현재 위치'
    });
    currentMarker.setMap(map);

    // 정보창
    const infoWindow = new window.kakao.maps.InfoWindow({
      content: '<div style="padding:5px;font-size:12px;">📍 현재 위치</div>'
    });

    window.kakao.maps.event.addListener(currentMarker, 'click', () => {
      infoWindow.open(map, currentMarker);
    });

    return () => {
      currentMarker.setMap(null);
    };
  }, [map, currentLocation]);

  // 스터디홀 마커들
  useEffect(() => {
    if (!map || !studyHalls.length) return;

    console.log('스터디홀 마커 추가:', studyHalls.length, '개');
    const markers = [];

    studyHalls.forEach((hall, index) => {
      console.log(`${index + 1}. ${hall.name} - ${hall.latitude}, ${hall.longitude}`);
      
      const position = new window.kakao.maps.LatLng(hall.latitude, hall.longitude);
      const isSelected = selectedStudyHall && selectedStudyHall.id === hall.id;
      
      const marker = new window.kakao.maps.Marker({
        position: position,
        title: hall.name
      });
      marker.setMap(map);
      markers.push(marker);

      // 정보창
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding:10px; min-width:200px;">
            <h4 style="margin:0 0 5px 0;">${hall.name}</h4>
            <p style="margin:0; font-size:12px; color:#666;">${hall.simpleAddress}</p>
            <p style="margin:5px 0 0 0; font-size:12px;">
              총 ${hall.totalRooms || 0}개 룸 
              ${hall.availableRooms !== undefined ? `(이용가능: ${hall.availableRooms}개)` : ''}
            </p>
          </div>
        `
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        infoWindow.open(map, marker);
        if (onStudyHallSelect) {
          onStudyHallSelect(hall);
        }
      });

      // 선택된 스터디홀인 경우 자동으로 정보창 열기
      if (isSelected) {
        infoWindow.open(map, marker);
      }
    });

    console.log('✅ 모든 마커 추가 완료');

    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [map, studyHalls, selectedStudyHall, onStudyHallSelect]);

  return (
    <div className={styles.mapContainer}>
      <div ref={mapRef} className={styles.map} style={{ width: '100%', height: '600px' }} />
      
      {/* 지도 컨트롤 */}
      {map && (
        <div className={styles.mapControls}>
          {currentLocation && (
            <button 
              className={styles.currentLocationBtn}
              onClick={() => {
                const moveLatLng = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
                map.setCenter(moveLatLng);
                map.setLevel(3);
              }}
              title="현재 위치로 이동"
            >
              📍
            </button>
          )}
          
          <div className={styles.zoomControls}>
            <button 
              className={styles.zoomBtn}
              onClick={() => {
                const level = map.getLevel();
                map.setLevel(level - 1);
              }}
              title="확대"
            >
              +
            </button>
            <button 
              className={styles.zoomBtn}
              onClick={() => {
                const level = map.getLevel();
                map.setLevel(level + 1);
              }}
              title="축소"
            >
              -
            </button>
          </div>
        </div>
      )}

      {/* 상태 표시 */}
      <div className={styles.debugInfo} style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <div>카카오: {window.kakao ? '✅' : '❌'}</div>
        <div>지도: {(window.kakao && window.kakao.maps) ? '✅' : '❌'}</div>
        <div>로드됨: {isKakaoLoaded ? '✅' : '❌'}</div>
        <div>지도객체: {map ? '✅' : '❌'}</div>
        <div>스터디홀: {studyHalls.length}개</div>
        <div>현재위치: {currentLocation ? '✅' : '❌'}</div>
      </div>

      {studyHalls.length === 0 && (
        <div className={styles.noResults}>
          <p>표시할 스터디홀이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default MapContainer;