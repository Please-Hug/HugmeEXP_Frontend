import api from './axiosInstance';

// API 파라미터 유효성 검사 및 변환
export const validateAndBuildParams = (filters) => {
  const { salary, experience, education, selectedSkills, regionFilter, isMapSearchActive, mapBounds } = filters;
  const params = {};

  // Salary
  if (salary) {
    if (salary === 3000) {
      params.salaryMin = 3000;
      params.salaryMax = 3999;
    } else if (salary === 4000) {
      params.salaryMin = 4000;
      params.salaryMax = 4999;
    } else if (salary === 6000) {
      params.salaryMin = 6000;
    }
  }

  // Experience
  if (experience > 0) {
    params.experience = experience - 1; // 0: 신입, 1: 1년차...
  }

  // Education
  if (education > 0) {
    params.education = education * 10; // 1: 고졸 -> 10, 2: 전문대졸 -> 20
  }

  // Tech Stacks
  if (selectedSkills && selectedSkills.length > 0) {
    params.techStacks = selectedSkills;
  }

  // Work Location
  if (regionFilter && regionFilter !== "all") {
    params.workLocation = regionFilter;
  }

  // Map Bounds
  if (isMapSearchActive && mapBounds) {
    if (mapBounds.northEast && mapBounds.southWest) {
      params.topLeftLat = mapBounds.northEast.lat;
      params.topLeftLng = mapBounds.southWest.lng;
      params.bottomRightLat = mapBounds.southWest.lat;
      params.bottomRightLng = mapBounds.northEast.lng;
    }
  }

  return params;
};

export const getRecruitments = async (params) => {
  try {
    const response = await api.get('/api/v1/recruitments', { params });
    if (response.status === 204) {
      return []; // 데이터가 없는 경우 빈 배열 반환
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching recruitments:', error);
    throw error; // 에러를 다시 던져서 호출하는 쪽에서 처리할 수 있도록 함
  }
};
