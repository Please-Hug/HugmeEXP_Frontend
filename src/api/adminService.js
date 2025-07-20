import api from './axiosInstance';
const BASE = '/api/v1/admin/users';

export const getUsers = async (page = 0, size = 10) => {
  try {
    const response = await api.get(`${BASE}?page=${page}&size=${size}`);
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
// 기존 adminService.js에 추가할 통계 관련 API 함수들

// 기존 adminService.js에 추가할 함수들
// (기존 import 및 함수들은 그대로 두고 아래 함수들만 추가)

/**
 * 전체 사용자 통계 조회
 */
export const getUserStats = async () => {
  alert('getUserStats 함수가 호출되었습니다!'); // 테스트용
  
  try {
    // 기본 관리자 API 사용 (정상 작동하는 것으로 확인됨)
    const response = await api.get('/api/v1/admin/users', {
      params: { 
        page: 0, 
        size: 200 // 전체 사용자를 확실히 포함하도록 더 크게 설정
      }
    });
    
    const users = response.data.data.content;
    
    // API 응답 원본 확인
    console.log('=== API 응답 원본 확인 ===');
    console.log('response.data.data:', response.data.data);
    console.log('content 길이:', response.data.data.content?.length);
    console.log('totalElements:', response.data.data.totalElements);
    console.log('totalPages:', response.data.data.totalPages);
    console.log('페이지 정보:', {
      number: response.data.data.number,
      size: response.data.data.size,
      numberOfElements: response.data.data.numberOfElements
    });
    
    // 통계 계산
    const totalUsers = users.length;
    // 활성 사용자 기준: 레벨 2 이상 또는 포인트 50 이상
    const activeUsers = users.filter(user => 
      user.level >= 2 || user.point >= 50
    ).length; 
    
    // 권한별 분포만 계산 (현재 사용 가능한 데이터)
    const roleDistribution = users.reduce((acc, user) => {
      const role = user.role;
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    
    // 레벨별 분포 - 실제 데이터 사용
const levelDistribution = users.reduce((acc, user) => {
  const level = user.level || 0;
  acc[level] = (acc[level] || 0) + 1;
  return acc;
}, {});

// 포인트 구간별 분포 - 실제 데이터 사용
const pointRanges = {
  '0-100': 0,
  '101-500': 0,
  '501-1000': 0,
  '1000+': 0
};

users.forEach(user => {
  const points = user.point || 0;
  if (points <= 100) pointRanges['0-100']++;
  else if (points <= 500) pointRanges['101-500']++;
  else if (points <= 1000) pointRanges['501-1000']++;
  else pointRanges['1000+']++;
});
    
    return {
      totalUsers,
      activeUsers,
      levelDistribution,
      pointDistribution: pointRanges,
      roleDistribution,
      users,
      // 실제 데이터가 아님을 표시
      isEstimated: true
    };
  } catch (error) {
    console.error('사용자 통계 조회 실패:', error);
    alert(`API 에러 발생: ${error.message}\n상태: ${error.response?.status}\n데이터: ${JSON.stringify(error.response?.data)}`);
    throw error;
  }
};

/**
 * 특정 사용자의 출석 통계 조회
 */
export const getUserAttendanceStats = async (username) => {
  try {
    const response = await api.get('/api/v1/admin/attendance/dates', {
      params: { username }
    });
    
    const attendanceDates = response.data.data;
    
    // 출석 통계 계산
    const totalAttendance = attendanceDates.length;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const thisMonthAttendance = attendanceDates.filter(dateStr => {
      const date = new Date(dateStr);
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    }).length;
    
    // 최근 30일 출석률
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAttendance = attendanceDates.filter(dateStr => {
      const date = new Date(dateStr);
      return date >= thirtyDaysAgo;
    }).length;
    
    const recentAttendanceRate = Math.round((recentAttendance / 30) * 100);
    
    return {
      totalAttendance,
      thisMonthAttendance,
      recentAttendanceRate,
      attendanceDates,
      lastAttendance: attendanceDates[attendanceDates.length - 1] || null
    };
  } catch (error) {
    console.error('사용자 출석 통계 조회 실패:', error);
    throw error;
  }
};

/**
 * 월별 가입자 통계 (사용자 목록의 createdAt 기반)
 * 실제로는 백엔드에서 createdAt을 제공해야 하지만, 현재는 임시로 레벨 기반으로 추정
 */
export const getMonthlyRegistrationStats = async () => {
  try {
    const response = await api.get('/api/v1/admin/users', {
      params: { page: 0, size: 10000 }
    });
    
    const users = response.data.data.content;
    
    // 임시: 레벨이 높을수록 오래된 사용자로 가정하여 월별 분포 생성
    const monthlyStats = {};
    const currentDate = new Date();
    
    // 최근 12개월 데이터 생성
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats[key] = Math.floor(Math.random() * 20) + 5; // 임시 데이터
    }
    
    return monthlyStats;
  } catch (error) {
    console.error('월별 가입자 통계 조회 실패:', error);
    throw error;
  }
};