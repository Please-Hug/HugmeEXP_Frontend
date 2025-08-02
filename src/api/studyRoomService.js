// 더미 데이터 - 테스트용
const DUMMY_STUDY_HALLS = [
  {
    id: 1,
    name: "강남 스터디카페 A",
    description: "24시간 운영하는 조용한 스터디카페",
    simpleAddress: "강남구 테헤란로",
    address: "서울 강남구 테헤란로 123",
    latitude: 37.5013,
    longitude: 127.0396,
    thumbnail: null,
    openTime: "2024-01-01T00:00:00",
    closeTime: "2024-01-01T23:59:00",
    availableRooms: 3,
    totalRooms: 10
  },
  {
    id: 2,
    name: "역삼 스터디룸 B",
    description: "개인실 중심의 프리미엄 스터디룸",
    simpleAddress: "강남구 역삼동",
    address: "서울 강남구 역삼동 456",
    latitude: 37.4999,
    longitude: 127.0374,
    thumbnail: null,
    openTime: "2024-01-01T06:00:00",
    closeTime: "2024-01-01T24:00:00",
    availableRooms: 0,
    totalRooms: 8
  },
  {
    id: 3,
    name: "논현 스터디카페 C",
    description: "카페와 스터디룸이 함께 있는 복합공간",
    simpleAddress: "강남구 논현동",
    address: "서울 강남구 논현동 789",
    latitude: 37.5109,
    longitude: 127.0258,
    thumbnail: null,
    openTime: "2024-01-01T07:00:00",
    closeTime: "2024-01-01T22:00:00",
    availableRooms: 5,
    totalRooms: 12
  },
  {
    id: 4,
    name: "신사 스터디라운지 D",
    description: "모던한 인테리어의 스터디 공간",
    simpleAddress: "강남구 신사동",
    address: "서울 강남구 신사동 321",
    latitude: 37.5200,
    longitude: 127.0194,
    thumbnail: null,
    openTime: "2024-01-01T08:00:00",
    closeTime: "2024-01-01T23:00:00",
    availableRooms: 2,
    totalRooms: 6
  }
];

// 거리 계산 함수 (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // 소수점 둘째 자리까지
};

/**
 * 모든 스터디홀 위치 조회 (지도 표시용)
 */
export const getAllStudyHallsForMap = async () => {
  try {
    console.log("더미 데이터: 모든 스터디홀 조회");
    // 실제 API 호출 대신 더미 데이터 반환
    await new Promise(resolve => setTimeout(resolve, 500)); // 네트워크 지연 시뮬레이션
    
    return {
      data: DUMMY_STUDY_HALLS,
      message: "모든 스터디홀 위치 정보를 조회했습니다."
    };
  } catch (error) {
    console.error("스터디홀 위치 조회 실패:", error);
    throw error;
  }
};

/**
 * 현재 위치 기반 주변 스터디홀 검색
 */
export const searchNearbyStudyHalls = async ({ latitude, longitude, radius = 10.0, limit = 50 }) => {
  try {
    console.log(`더미 데이터: 주변 검색 - lat: ${latitude}, lng: ${longitude}, radius: ${radius}km`);
    await new Promise(resolve => setTimeout(resolve, 800)); // 네트워크 지연 시뮬레이션
    
    // 현재 위치에서 각 스터디홀까지의 거리 계산
    const studyHallsWithDistance = DUMMY_STUDY_HALLS.map(hall => {
      const distance = calculateDistance(latitude, longitude, hall.latitude, hall.longitude);
      return {
        ...hall,
        distance: distance
      };
    });

    // 반경 내 필터링 및 거리순 정렬
    const nearbyHalls = studyHallsWithDistance
      .filter(hall => hall.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return {
      data: nearbyHalls,
      message: `반경 ${radius}km 내 스터디홀 ${nearbyHalls.length}개를 찾았습니다.`
    };
  } catch (error) {
    console.error("주변 스터디홀 검색 실패:", error);
    throw error;
  }
};

/**
 * 특정 스터디홀 상세 정보 조회
 */
export const getStudyHallDetail = async (studyHallId) => {
  try {
    console.log(`더미 데이터: 스터디홀 상세 조회 - ID: ${studyHallId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const studyHall = DUMMY_STUDY_HALLS.find(hall => hall.id === parseInt(studyHallId));
    
    if (!studyHall) {
      throw new Error("스터디홀을 찾을 수 없습니다.");
    }

    return {
      data: studyHall,
      message: "스터디홀 상세 정보를 조회했습니다."
    };
  } catch (error) {
    console.error("스터디홀 상세 정보 조회 실패:", error);
    throw error;
  }
};

/**
 * 현재 위치로부터 특정 스터디홀까지의 거리 계산
 */
export const getStudyHallWithDistance = async (studyHallId, latitude, longitude) => {
  try {
    console.log(`더미 데이터: 거리 계산 - ID: ${studyHallId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const studyHall = DUMMY_STUDY_HALLS.find(hall => hall.id === parseInt(studyHallId));
    
    if (!studyHall) {
      throw new Error("스터디홀을 찾을 수 없습니다.");
    }

    const distance = calculateDistance(latitude, longitude, studyHall.latitude, studyHall.longitude);

    return {
      data: {
        ...studyHall,
        distance: distance
      },
      message: "스터디홀 정보와 거리를 계산했습니다."
    };
  } catch (error) {
    console.error("스터디홀 거리 계산 실패:", error);
    throw error;
  }
};

/**
 * 주소로 스터디홀 검색
 */
export const searchStudyHallsByAddress = async (address) => {
  try {
    console.log(`더미 데이터: 주소 검색 - ${address}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const filteredHalls = DUMMY_STUDY_HALLS.filter(hall => 
      hall.address.includes(address) || hall.simpleAddress.includes(address)
    );

    return {
      data: filteredHalls,
      message: `주소 '${address}'로 ${filteredHalls.length}개의 스터디홀을 찾았습니다.`
    };
  } catch (error) {
    console.error("주소로 스터디홀 검색 실패:", error);
    throw error;
  }
};

/**
 * 이름으로 스터디홀 검색
 */
export const searchStudyHallsByName = async (name) => {
  try {
    console.log(`더미 데이터: 이름 검색 - ${name}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const filteredHalls = DUMMY_STUDY_HALLS.filter(hall => 
      hall.name.includes(name)
    );

    return {
      data: filteredHalls,
      message: `이름 '${name}'로 ${filteredHalls.length}개의 스터디홀을 찾았습니다.`
    };
  } catch (error) {
    console.error("이름으로 스터디홀 검색 실패:", error);
    throw error;
  }
};

/**
 * 브라우저의 Geolocation API를 사용하여 현재 위치 조회
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("이 브라우저는 위치 서비스를 지원하지 않습니다."));
      return;
    }

    const options = {
      enableHighAccuracy: true, // 높은 정확도 요청
      timeout: 10000,          // 10초 타임아웃
      maximumAge: 300000       // 5분간 캐시 사용
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`현재 위치: ${latitude}, ${longitude} (정확도: ${accuracy}m)`);
        resolve({
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let errorMessage = "위치 정보를 가져올 수 없습니다.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "위치 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "위치 정보를 사용할 수 없습니다.";
            break;
          case error.TIMEOUT:
            errorMessage = "위치 정보 요청이 시간 초과되었습니다.";
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

/**
 * 위치 정확도 검사 및 사용자 가이드
 */
export const checkLocationAccuracy = (accuracy) => {
  if (accuracy <= 100) {
    return {
      level: "high",
      message: "위치가 정확합니다.",
      color: "green"
    };
  } else if (accuracy <= 1000) {
    return {
      level: "medium", 
      message: "위치가 대략적으로 파악되었습니다.",
      color: "orange"
    };
  } else {
    return {
      level: "low",
      message: "위치가 부정확합니다. 직접 입력하거나 지도에서 선택해주세요.",
      color: "red"
    };
  }
};