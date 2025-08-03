import React, { useEffect, useRef, useState } from "react";
import styles from "./KakaoMapPicker.module.scss";

function KakaoMapPicker({ onSelect, initialCoordinates, onClose }) {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: initialCoordinates?.latitude || 37.5665,
    longitude: initialCoordinates?.longitude || 126.9780,
    address: "",
    simpleAddress: "",
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");

  // 카카오 지도 스크립트 로드
  useEffect(() => {
    const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    
    // 이미 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsScriptLoaded(true);
      });
    };

    script.onerror = () => {
      setLoadError("카카오 지도 API를 로드하는데 실패했습니다. API 키를 확인해주세요.");
    };

    if (!KAKAO_API_KEY) {
      setLoadError("카카오 지도 API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.");
      return;
    }

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isScriptLoaded || !mapContainer.current) return;

    try {
      const options = {
        center: new window.kakao.maps.LatLng(
          selectedLocation.latitude,
          selectedLocation.longitude
        ),
        level: 3,
      };

      const kakaoMap = new window.kakao.maps.Map(mapContainer.current, options);
      setMap(kakaoMap);

      // 클릭 이벤트 등록
      window.kakao.maps.event.addListener(kakaoMap, "click", (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        updateMarkerPosition(kakaoMap, latlng);
      });
    } catch (error) {
      console.error("지도 초기화 오류:", error);
      setLoadError("지도를 초기화하는데 실패했습니다.");
    }
  }, [isScriptLoaded]);

  // 마커 업데이트
  const updateMarkerPosition = (kakaoMap, latlng) => {
    const lat = latlng.getLat();
    const lng = latlng.getLng();

    // 기존 마커 제거
    if (marker) {
      marker.setMap(null);
    }

    // 새 마커 생성
    const newMarker = new window.kakao.maps.Marker({
      position: latlng,
      map: kakaoMap,
    });

    setMarker(newMarker);

    // 주소 검색
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2Address(lng, lat, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const addr = result[0].address;
        setSelectedLocation({
          latitude: lat,
          longitude: lng,
          address: addr.address_name,
          simpleAddress: `${addr.region_2depth_name} ${addr.region_3depth_name}`,
        });
      } else {
        setSelectedLocation({
          latitude: lat,
          longitude: lng,
          address: "",
          simpleAddress: "",
        });
      }
    });
  };

  // 키워드 검색
  const handleSearch = () => {
    if (!searchKeyword.trim() || !map) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const firstResult = data[0];
        const latlng = new window.kakao.maps.LatLng(firstResult.y, firstResult.x);
        
        map.setCenter(latlng);
        updateMarkerPosition(map, latlng);
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  // 선택 확인
  const handleConfirm = () => {
    onSelect(selectedLocation);
  };

  if (loadError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{loadError}</p>
          <p className={styles.note}>
            개발자는 .env 파일에 VITE_KAKAO_MAP_API_KEY를 설정해야 합니다.
          </p>
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mapWrapper}>
        <div className={styles.header}>
          <h3>위치 선택</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="주소 또는 장소를 검색하세요"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>검색</button>
        </div>

        <div ref={mapContainer} className={styles.map} />

        <div className={styles.locationInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>위도:</span>
            <span>{selectedLocation.latitude.toFixed(6)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>경도:</span>
            <span>{selectedLocation.longitude.toFixed(6)}</span>
          </div>
          {selectedLocation.address && (
            <>
              <div className={styles.infoRow}>
                <span className={styles.label}>주소:</span>
                <span>{selectedLocation.address}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>간단 주소:</span>
                <span>{selectedLocation.simpleAddress}</span>
              </div>
            </>
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            선택
          </button>
        </div>
      </div>
    </div>
  );
}

export default KakaoMapPicker;