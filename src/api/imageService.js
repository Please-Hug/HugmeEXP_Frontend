import apiInstance from './axiosInstance';

const BASE_PATH = '/api/v1/images';

// 이미지 업로드 서비스
export const imageApi = {
  // 범용 이미지 업로드
  upload: async (file, folder) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const response = await apiInstance.post(`${BASE_PATH}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 스터디 다이어리 이미지 업로드
  uploadStudyDiary: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiInstance.post(`${BASE_PATH}/studydiary`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 프로필 이미지 업로드
  uploadProfile: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiInstance.post(`${BASE_PATH}/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 이미지 삭제
  delete: async (imageKey) => {
    const response = await apiInstance.delete(`${BASE_PATH}/${imageKey}`);
    return response.data;
  },

  // 이미지 URL 조회
  getUrl: async (imageKey) => {
    const response = await apiInstance.get(`${BASE_PATH}/${imageKey}/url`);
    return response.data;
  },
};

export default imageApi;