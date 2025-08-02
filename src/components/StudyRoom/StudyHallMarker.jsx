import { useEffect, useRef } from "react";

// 마커 타입별 설정
const MARKER_TYPES = {
  CURRENT_LOCATION: {
    size: { width: 20, height: 20 },
    offset: { x: 10, y: 10 },
    svg: (isActive = false) => `
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" fill="#007bff" stroke="white" stroke-width="3"/>
        <circle cx="10" cy="10" r="3" fill="white"/>
        ${isActive ? '<circle cx="10" cy="10" r="9" fill="none" stroke="#007bff" stroke-width="1" opacity="0.5"/>' : ''}
      </svg>
    `
  },
  STUDY_HALL: {
    size: { width: 30, height: 40 },
    offset: { x: 15, y: 40 },
    svg: (isSelected = false, availability = 'available') => {
      const getColor = () => {
        if (isSelected) return '#fd7e14'; // 선택된 경우 주황색
        if (availability === 'full') return '#dc3545'; // 만실인 경우 빨간색
        return '#28a745'; // 이용가능한 경우 초록색
      };
      
      const color = getColor();
      
      return `
        <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
          </defs>
          <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25C30 6.716 23.284 0 15 0z" 
                fill="${color}" stroke="white" stroke-width="2" filter="url(#shadow)"/>
          <circle cx="15" cy="15" r="9" fill="white"/>
          <text x="15" y="20" text-anchor="middle" fill="${color}" 
                font-size="14" font-weight="bold" font-family="sans-serif">S</text>
          ${isSelected ? '<circle cx="15" cy="15" r="12" fill="none" stroke="' + color + '" stroke-width="2" opacity="0.7"/>' : ''}
        </svg>
      `;
    }
  },
  CLUSTER: {
    size: { width: 40, height: 40 },
    offset: { x: 20, y: 20 },
    svg: (count = 1, color = '#007bff') => `
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="3" opacity="0.9"/>
        <text x="20" y="25" text-anchor="middle" fill="white" 
              font-size="12" font-weight="bold" font-family="sans-serif">${count}</text>
      </svg>
    `
  }
};

// 마커 생성 유틸리티 클래스
export class StudyHallMarkerUtil {
  
  /**
   * 현재 위치 마커 생성
   */
  static createCurrentLocationMarker(map, position, options = {}) {
    if (!window.kakao?.maps) return null;

    const markerImage = new window.kakao.maps.MarkerImage(
      'data:image/svg+xml;base64,' + btoa(MARKER_TYPES.CURRENT_LOCATION.svg(options.isActive)),
      new window.kakao.maps.Size(
        MARKER_TYPES.CURRENT_LOCATION.size.width,
        MARKER_TYPES.CURRENT_LOCATION.size.height
      ),
      {
        offset: new window.kakao.maps.Point(
          MARKER_TYPES.CURRENT_LOCATION.offset.x,
          MARKER_TYPES.CURRENT_LOCATION.offset.y
        )
      }
    );

    const marker = new window.kakao.maps.Marker({
      position: position,
      image: markerImage,
      zIndex: 10
    });

    marker.setMap(map);
    return marker;
  }

  /**
   * 스터디홀 마커 생성
   */
  static createStudyHallMarker(map, studyHall, options = {}) {
    if (!window.kakao?.maps || !studyHall.latitude || !studyHall.longitude) return null;

    const position = new window.kakao.maps.LatLng(studyHall.latitude, studyHall.longitude);
    
    // 이용가능 상태 계산
    const availableRooms = studyHall.availableRooms || 0;
    const totalRooms = studyHall.totalRooms || 0;
    const availability = availableRooms === 0 ? 'full' : 'available';

    const markerImage = new window.kakao.maps.MarkerImage(
      'data:image/svg+xml;base64,' + btoa(
        MARKER_TYPES.STUDY_HALL.svg(options.isSelected, availability)
      ),
      new window.kakao.maps.Size(
        MARKER_TYPES.STUDY_HALL.size.width,
        MARKER_TYPES.STUDY_HALL.size.height
      ),
      {
        offset: new window.kakao.maps.Point(
          MARKER_TYPES.STUDY_HALL.offset.x,
          MARKER_TYPES.STUDY_HALL.offset.y
        )
      }
    );

    const marker = new window.kakao.maps.Marker({
      position: position,
      image: markerImage,
      zIndex: options.isSelected ? 5 : 1
    });

    marker.setMap(map);

    // 마커 데이터 추가
    marker.studyHall = studyHall;
    marker.markerType = 'STUDY_HALL';

    return marker;
  }

  /**
   * 클러스터 마커 생성 (여러 스터디홀이 겹칠 때)
   */
  static createClusterMarker(map, position, studyHalls, options = {}) {
    if (!window.kakao?.maps) return null;

    const count = studyHalls.length;
    const color = count > 10 ? '#dc3545' : count > 5 ? '#fd7e14' : '#007bff';

    const markerImage = new window.kakao.maps.MarkerImage(
      'data:image/svg+xml;base64,' + btoa(MARKER_TYPES.CLUSTER.svg(count, color)),
      new window.kakao.maps.Size(
        MARKER_TYPES.CLUSTER.size.width,
        MARKER_TYPES.CLUSTER.size.height
      ),
      {
        offset: new window.kakao.maps.Point(
          MARKER_TYPES.CLUSTER.offset.x,
          MARKER_TYPES.CLUSTER.offset.y
        )
      }
    );

    const marker = new window.kakao.maps.Marker({
      position: position,
      image: markerImage,
      zIndex: 3
    });

    marker.setMap(map);

    // 클러스터 데이터 추가
    marker.studyHalls = studyHalls;
    marker.markerType = 'CLUSTER';

    return marker;
  }

  /**
   * 인포윈도우 생성
   */
  static createInfoWindow(studyHall, options = {}) {
    if (!window.kakao?.maps) return null;

    const content = this.generateInfoWindowContent(studyHall, options);
    
    return new window.kakao.maps.InfoWindow({
      content: content,
      removable: true,
      zIndex: 100
    });
  }

  /**
   * 인포윈도우 콘텐츠 생성
   */
  static generateInfoWindowContent(studyHall, options = {}) {
    const distanceText = studyHall.distance 
      ? `<div class="marker-distance">📍 ${studyHall.distance}km</div>`
      : '';
    
    const availableRooms = studyHall.availableRooms || 0;
    const totalRooms = studyHall.totalRooms || 0;
    
    const operatingHours = this.formatOperatingHours(studyHall.openTime, studyHall.closeTime);
    const operatingStatus = this.getOperatingStatus(studyHall.openTime, studyHall.closeTime);
    
    return `
      <div style="
        padding: 12px;
        min-width: 200px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.4;
      ">
        <div style="
          font-size: 16px;
          font-weight: 600;
          color: #212529;
          margin-bottom: 8px;
        ">${studyHall.name}</div>
        
        ${distanceText}
        
        <div style="margin-bottom: 8px;">
          <div style="
            font-size: 13px;
            color: #6c757d;
            margin-bottom: 4px;
          ">
            🪑 이용가능: ${availableRooms}/${totalRooms}
          </div>
          <div style="
            font-size: 13px;
            color: ${operatingStatus.color};
            margin-bottom: 4px;
          ">
            🕒 ${operatingStatus.text} (${operatingHours})
          </div>
        </div>
        
        <div style="
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
          padding-top: 8px;
          margin-top: 8px;
        ">${studyHall.simpleAddress || studyHall.address}</div>
        
        ${options.showDetailButton ? `
          <div style="margin-top: 8px; text-align: center;">
            <button style="
              background: #007bff;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
            " onclick="window.showStudyHallDetail(${studyHall.id})">
              상세보기
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 운영시간 포맷팅
   */
  static formatOperatingHours(openTime, closeTime) {
    if (!openTime || !closeTime) return "운영시간 미정";
    
    const formatTime = (timeStr) => {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    return `${formatTime(openTime)} - ${formatTime(closeTime)}`;
  }

  /**
   * 운영 상태 확인
   */
  static getOperatingStatus(openTime, closeTime) {
    if (!openTime || !closeTime) {
      return { text: "운영시간 미정", color: "#6c757d" };
    }

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const open = new Date(openTime);
    const close = new Date(closeTime);
    const openTime24 = open.getHours() * 100 + open.getMinutes();
    const closeTime24 = close.getHours() * 100 + close.getMinutes();

    if (currentTime >= openTime24 && currentTime <= closeTime24) {
      return { text: "운영중", color: "#28a745" };
    } else {
      return { text: "영업종료", color: "#dc3545" };
    }
  }

  /**
   * 정확도 원 생성
   */
  static createAccuracyCircle(map, position, accuracy) {
    if (!window.kakao?.maps || !accuracy) return null;

    return new window.kakao.maps.Circle({
      center: position,
      radius: accuracy, // 미터 단위
      strokeWeight: 2,
      strokeColor: "#007bff",
      strokeOpacity: 0.8,
      fillColor: "#007bff",
      fillOpacity: 0.2,
    });
  }
}

// React 컴포넌트 (필요한 경우 사용)
const StudyHallMarker = ({ 
  map, 
  studyHall, 
  isSelected, 
  onClick,
  onInfoWindowOpen 
}) => {
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    if (!map || !studyHall) return;

    // 마커 생성
    const marker = StudyHallMarkerUtil.createStudyHallMarker(map, studyHall, { isSelected });
    markerRef.current = marker;

    // 클릭 이벤트
    if (onClick) {
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onClick(studyHall);
      });
    }

    // 인포윈도우 이벤트
    if (onInfoWindowOpen) {
      window.kakao.maps.event.addListener(marker, 'click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        const infoWindow = StudyHallMarkerUtil.createInfoWindow(studyHall);
        infoWindow.open(map, marker);
        infoWindowRef.current = infoWindow;
        
        onInfoWindowOpen(infoWindow, studyHall);
      });
    }

    // cleanup
    return () => {
      if (marker) {
        marker.setMap(null);
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [map, studyHall, isSelected, onClick, onInfoWindowOpen]);

  return null; // 렌더링할 DOM 없음
};

export default StudyHallMarker;