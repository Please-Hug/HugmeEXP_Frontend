import api from './axiosInstance';
const BASE = '/api/v1/admin/users';

export const getUsers = async () => {
  try {
    const response = await api.get(BASE);
    return response.data;
  } catch (error) {
    console.error("getUsers 실패:", error);
    throw error;
  }
};

export const getUser = async (username) => {
  try {
    const response = await api.get(`${BASE}/${username}`);
    return response.data;
  } catch (error) {
    console.error("getUser 실패:", error);
    throw error;
  }
};

export const updateUser = async (username, data) => {
  try {
    const response = await api.patch(`${BASE}/${username}`, data);
    return response.data;
  } catch (error) {
    console.error("updateUser 실패:", error);
    console.error("에러 상태:", error.response?.status);
    console.error("에러 데이터:", error.response?.data);
    throw error;
  }
};

export const deleteUser = async (username) => {
  try {
    const response = await api.delete(`${BASE}/${username}`);
    return response.data;
  } catch (error) {
    console.error("deleteUser 실패:", error);
    throw error;
  }
};

export const changeUserRole = async (username, role) => {
  try {
    console.log('권한 변경 API 호출:', username, role);
    const response = await api.patch(`${BASE}/${username}/role`, { role });
    console.log('권한 변경 API 응답:', response);
    return response.data;
  } catch (error) {
    console.error("권한 변경 실패:", error);
    throw error;
  }
};
