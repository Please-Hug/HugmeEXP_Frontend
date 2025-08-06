import api from "./axiosInstance";

// 급여 범위 상수 정의
const SALARY_RANGES = {
  3000: { min: 3000, max: 3999 },
  4000: { min: 4000, max: 4999 },
  6000: { min: 6000, max: null },
};

// API 파라미터 유효성 검사 및 변환
export const validateAndBuildParams = (filters) => {
  const {
    salary,
    experience,
    education,
    selectedSkills,
    regionFilter,
    isMapSearchActive,
    mapBounds,
    keyword,
  } = filters;
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

  // Experience - 백엔드에서는 experienceMin, experienceMax 파라미터 필요
  if (Array.isArray(experience) && experience.length >= 2) {
    // 배열 [min, max] 형태로 전달
    let min = experience[0];
    let max = experience[1];

    // -1은 신입으로 0으로 변환
    if(min === -1 && max === 10){
      params.experienceMin = null;
      params.experienceMax = null;
      min = null;
      max = null;
    }
    else if (min === -1) {
      params.experienceMin = 0;
    } else if (min >= 0) {
      params.experienceMin = min;
    }

    // 최대 경력 설정
    if (max >= 0 && max < 100) {
      // 경력 무관이 아닌 경우
      params.experienceMax = max;
    }
  } else if (typeof experience === "number") {
    if (experience === -1) {
      params.experienceMin = 0;
      params.experienceMax = 0; // 신입
    } else if (experience > 0) {
      params.experienceMin = experience - 1;
    }
  }

  // Education
  if (education > 0) {
    params.education = education // 1: 고졸 -> 10, 2: 전문대졸 -> 20
  }

  // Tech Stacks - ID 목록으로 전송
  if (selectedSkills && selectedSkills.length > 0) {
    // 배열 형식으로 전송하는 대신 쉼표로 구분된 문자열로 변환
    params.techStacks = selectedSkills.join(',');
  }

  // Work Location
  if (regionFilter && regionFilter !== "all") {
    params.workLocation = regionFilter;
  }

  // Map Bounds
  if (isMapSearchActive && mapBounds) {
    if (mapBounds.northEast && mapBounds.southWest) {
      params.topLeftLat = mapBounds.northEast.lat.toFixed(8);
      params.topLeftLng = mapBounds.southWest.lng.toFixed(8);
      params.bottomRightLat = mapBounds.southWest.lat.toFixed(8);
      params.bottomRightLng = mapBounds.northEast.lng.toFixed(8);
    }
  }

  // Keyword search
  if (keyword && keyword.trim() !== '') {
    params.keyword = keyword.trim();
  }

  return params;
};

export const getRecruitments = async (params) => {
  try {
    console.log("API params:", params);
    const response = await api.get("/api/v1/recruitments", { params });
    if (response.status === 204) {
      return []; // 데이터가 없는 경우 빈 배열 반환
    }
    // 백엔드 응답 구조: { message: string, data: RecruitmentResponseDTO[] }
    if (response.data && response.data.data) {
      return response.data.data; // data 필드에서 채용 공고 목록 추출
    }
    console.warn("Unexpected response format:", response.data);
    return [];
  } catch (error) {
    console.error("Error fetching recruitments:", error);
    throw error; // 에러를 다시 던져서 호출하는 쪽에서 처리할 수 있도록 함
  }
};

// 채용 공고 필터 옵션 조회 (기술 스택, 교육, 경력 등)
export const getRecruitmentFilters = async () => {
  try {
    const response = await api.get("/api/v1/recruitments/filters");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching recruitment filters:", error);
    throw error;
  }
};

export const getLatestRecruitments = async () => {
  try {
    const response = await api.get("/api/v1/recruitments/home");
    if (response.status === 204) {
      return [];
    }
    if (response.data && response.data.data) {
      return response.data.data;
    }
    console.warn("Unexpected response format:", response.data);
    return [];
  } catch (error) {
    console.error("Error fetching latest recruitments:", error);
    throw error;
  }
};

// 채용 공고 상세 정보 조회
export const getRecruitmentDetail = async (id) => {
  console.log("Fetching recruitment detail for ID:", id);
  try {
    const response = await api.get(`/api/v1/recruitments/${id}`);
    if (response.status === 204) {
      return null; // 데이터가 없는 경우 null 반환
    }
    // 백엔드 응답 구조: { message: string, data: RecruitmentDetailResponseDTO }
    if (response.data && response.data.data) {
      return response.data.data; // data 필드에서 채용 공고 상세 정보 추출
    }
    console.warn("Unexpected response format:", response.data);
    return null;
  } catch (error) {
    console.error(`Error fetching recruitment detail for ID ${id}:`, error);
    throw error; // 에러를 다시 던져서 호출하는 쪽에서 처리할 수 있도록 함
  }
};

// 검색창 연관 검색어 제공
export const getSearchSuggestions = async (keyword) => {
  try {
    if (!keyword || keyword.trim() === "") {
      return [];
    }
    
    console.log("Searching companies with keyword:", keyword);
    const response = await api.get("/api/v1/recruitments/companies", { 
      params: { keyword: keyword.trim() } 
    });
    
    if (response.status === 204) {
      return []; // 데이터가 없는 경우 빈 배열 반환
    }
    
    if (response.data && response.data.data) {
      return response.data.data; // data 필드에서 회사 검색 결과 추출
    
    }
    
    console.warn("Unexpected response format:", response.data);
    return [];
  } catch (error) {
    console.error(`Error searching companies with keyword ${keyword}:`, error);
    throw error;
  }
};
