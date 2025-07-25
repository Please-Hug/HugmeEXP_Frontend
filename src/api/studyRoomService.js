import api from "./axiosInstance";

export const getReservations = async (page = 0, size = 10, sort = "createdAt", direction = "DESC") => {
  try {
    const response = await api.get("/api/v1/studyroom/reservations", {
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
    const response = await api.get(`/api/v1/studyroom/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error("예약 상세 조회 실패:", error);
    throw error;
  }
};

export const createReservation = async (reservationData) => {
  try {
    const response = await api.post("/api/v1/studyroom/reservations", reservationData);
    return response.data;
  } catch (error) {
    console.error("예약 생성 실패:", error);
    throw error;
  }
};

export const cancelReservation = async (reservationId) => {
  try {
    const response = await api.delete(`/api/v1/studyroom/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error("예약 취소 실패:", error);
    throw error;
  }
};