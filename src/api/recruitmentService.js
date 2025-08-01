import api from './axiosInstance';

// 급여 범위 상수 정의
const SALARY_RANGES = {
  3000: { min: 3000, max: 3999 },
  4000: { min: 4000, max: 4999 },
  6000: { min: 6000, max: null }
};

// API 파라미터 유효성 검사 및 변환
export const validateAndBuildParams = (filters) => {
  const { salary, experience, education, selectedSkills, regionFilter, isMapSearchActive, mapBounds } = filters;
  const params = {};

  // Salary
  if (salary) {
    const salaryRange = SALARY_RANGES[salary];
    if (salaryRange) {
      params.salaryMin = salaryRange.min;
      if (salaryRange.max) {
        params.salaryMax = salaryRange.max;
      }
    }
  }

  // Experience
  if (Array.isArray(experience)) {
    // 배열의 첫 번째 값(최소 경력) 사용
    if (experience[0] > -1) {
      params.experience = experience[0]; // -1: 신입, 0: 1년차...
    }
  } else if (typeof experience === 'number' && experience > 0) {
    params.experience = experience - 1;
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
