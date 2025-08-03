import apiInstance from './axiosInstance';

// 관리자용 예약 API
export const adminReservationApi = {
  // 전체 예약 조회
  getAllReservations: async (page = 0, size = 20, sort = 'id') => {
    const response = await apiInstance.get('/api/v1/admin/reservations', {
      params: { page, size, sort }
    });
    return response.data;
  },

  // 예약 강제 취소
  forceDeleteReservation: async (reservationId) => {
    const response = await apiInstance.delete(`/api/v1/admin/reservations/${reservationId}`);
    return response.data;
  },
};

// 사용자용 예약 API
export const userReservationApi = {
  // 예약 생성
  createReservation: async (reservationData) => {
    const response = await apiInstance.post('/api/v1/studyroom/reservations', reservationData);
    return response.data;
  },

  // 예약 상세 조회
  getReservation: async (reservationId) => {
    const response = await apiInstance.get(`/api/v1/studyroom/reservations/${reservationId}`);
    return response.data;
  },

  // 사용자 예약 목록 조회
  getUserReservations: async (page = 0, size = 10, sort = 'createdAt,desc') => {
    const response = await apiInstance.get('/api/v1/studyroom/reservations', {
      params: { page, size, sort }
    });
    return response.data;
  },

  // 예약 취소
  cancelReservation: async (reservationId) => {
    const response = await apiInstance.delete(`/api/v1/studyroom/reservations/${reservationId}`);
    return response.data;
  },
};

export default {
  admin: adminReservationApi,
  user: userReservationApi,
};