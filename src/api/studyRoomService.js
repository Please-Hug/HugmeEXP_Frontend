import api from "./axiosInstance";

// 모든 스터디홀 위치 조회 (지도용)
export const getAllStudyHallsForMap = async () => {
  try {
    const response = await api.get("/api/v1/studyroom/map/halls");
    return response.data;
  } catch (error) {
    console.error("스터디홀 위치 정보 가져오기 실패:", error);
    throw error;
  }
};

// 현재 위치 기반 주변 스터디홀 검색
export const searchNearbyStudyHalls = async (latitude, longitude, radius = 10.0, limit = 50) => {
  try {
    const response = await api.post("/api/v1/studyroom/map/nearby", {
      latitude,
      longitude,
      radius,
      limit
    });
    return response.data;
  } catch (error) {
    console.error("주변 스터디홀 검색 실패:", error);
    throw error;
  }
};

// 특정 스터디홀 상세 정보 조회
export const getStudyHallDetail = async (studyHallId) => {
  try {
    const response = await api.get(`/api/v1/studyroom/halls/${studyHallId}`);
    return response.data;
  } catch (error) {
    console.error("스터디홀 상세 정보 가져오기 실패:", error);
    throw error;
  }
};

// 현재 위치로부터 특정 스터디홀까지의 거리 계산
export const getStudyHallWithDistance = async (studyHallId, latitude, longitude) => {
  try {
    const response = await api.get(`/api/v1/studyroom/halls/${studyHallId}/distance`, {
      params: { latitude, longitude }
    });
    return response.data;
  } catch (error) {
    console.error("스터디홀 거리 계산 실패:", error);
    throw error;
  }
};

// 주소로 스터디홀 검색
export const searchStudyHallsByAddress = async (address) => {
  try {
    const response = await api.get("/api/v1/studyroom/search/address", {
      params: { address }
    });
    return response.data;
  } catch (error) {
    console.error("주소로 스터디홀 검색 실패:", error);
    throw error;
  }
};

// 이름으로 스터디홀 검색
export const searchStudyHallsByName = async (name) => {
  try {
    const response = await api.get("/api/v1/studyroom/search/name", {
      params: { name }
    });
    return response.data;
  } catch (error) {
    console.error("이름으로 스터디홀 검색 실패:", error);
    throw error;
  }
};

// 스터디룸 예약 생성
export const createReservation = async (reservationData) => {
  try {
    const response = await api.post("/api/v1/studyroom/reservations", reservationData);
    return response.data;
  } catch (error) {
    console.error("스터디룸 예약 생성 실패:", error);
    throw error;
  }
};

// 예약 상세 조회
export const getReservationDetail = async (reservationId) => {
  try {
    const response = await api.get(`/api/v1/studyroom/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error("예약 상세 조회 실패:", error);
    throw error;
  }
};

// 사용자 예약 목록 조회
export const getReservations = async (page = 0, size = 10) => {
  try {
    const response = await api.get("/api/v1/studyroom/reservations", {
      params: { page, size, sort: "createdAt,desc" }
    });
    return response.data;
  } catch (error) {
    console.error("예약 목록 조회 실패:", error);
    throw error;
  }
};

// 예약 취소
export const deleteReservation = async (reservationId) => {
  try {
    const response = await api.delete(`/api/v1/studyroom/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error("예약 취소 실패:", error);
    throw error;
  }
};