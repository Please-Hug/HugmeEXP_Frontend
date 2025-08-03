import apiInstance from './axiosInstance';

const BASE_PATH = '/api/v1/admin/studyhalls';

// 스터디홀 관련 API
export const studyHallApi = {
  // 전체 스터디홀 조회
  getStudyHalls: async (page = 0, size = 20, sort = 'id') => {
    const response = await apiInstance.get(BASE_PATH, {
      params: { page, size, sort }
    });
    return response.data;
  },

  // 특정 스터디홀 조회
  getStudyHall: async (studyHallId) => {
    const response = await apiInstance.get(`${BASE_PATH}/${studyHallId}`);
    return response.data;
  },

  // 스터디홀 생성
  createStudyHall: async (studyHallData) => {
    const response = await apiInstance.post(BASE_PATH, studyHallData);
    return response.data;
  },

  // 스터디홀 수정
  updateStudyHall: async (studyHallId, studyHallData) => {
    const response = await apiInstance.put(`${BASE_PATH}/${studyHallId}`, studyHallData);
    return response.data;
  },

  // 스터디홀 삭제
  deleteStudyHall: async (studyHallId) => {
    const response = await apiInstance.delete(`${BASE_PATH}/${studyHallId}`);
    return response.data;
  },
};

// 스터디룸 관련 API
export const studyRoomApi = {
  // 스터디홀 내 모든 룸 조회
  getStudyRooms: async (studyHallId) => {
    const response = await apiInstance.get(`${BASE_PATH}/${studyHallId}/rooms`);
    return response.data;
  },

  // 스터디룸 생성
  createStudyRoom: async (studyHallId, roomData) => {
    const response = await apiInstance.post(`${BASE_PATH}/${studyHallId}/rooms`, roomData);
    return response.data;
  },

  // 스터디룸 수정
  updateStudyRoom: async (studyHallId, roomId, roomData) => {
    const response = await apiInstance.put(`${BASE_PATH}/${studyHallId}/rooms/${roomId}`, roomData);
    return response.data;
  },

  // 스터디룸 삭제
  deleteStudyRoom: async (studyHallId, roomId) => {
    const response = await apiInstance.delete(`${BASE_PATH}/${studyHallId}/rooms/${roomId}`);
    return response.data;
  },
};

// 예약 관련 API (사용자용)
export const getReservations = async (page = 0, size = 10, sort = "createdAt", direction = "DESC") => {
  try {
    const response = await apiInstance.get("/api/v1/studyroom/reservations", {
      params: { page, size, sort, direction }
    });
    return response.data;
  } catch (error) {
    console.error("예약 목록 조회 실패:", error);
    throw error;
  }
};

export const getReservationDetail = async (reservationId) => {
  try {
    const response = await apiInstance.get(`/api/v1/studyroom/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error("예약 상세 조회 실패:", error);
    throw error;
  }
};

export const createReservation = async (reservationData) => {
  try {
    const response = await apiInstance.post("/api/v1/studyroom/reservations", reservationData);
    return response.data;
  } catch (error) {
    console.error("예약 생성 실패:", error);
    throw error;
  }
};

export const cancelReservation = async (reservationId) => {
  try {
    const response = await apiInstance.delete(`/api/v1/studyroom/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error("예약 취소 실패:", error);
    throw error;
  }
};

export default {
  studyHall: studyHallApi,
  studyRoom: studyRoomApi,
};