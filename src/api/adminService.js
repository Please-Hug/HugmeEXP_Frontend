import api from './axiosInstance';

const BASE = '/api/v1/admin/users';

// ========================
// 기본 사용자 관리 API
// ========================

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

// ========================
// 통계 관련 API
// ========================

/**
 * 전체 사용자 통계 조회
 */
export const getUserStats = async () => {
  try {
    // 1. 사용자 목록 조회
    const usersResponse = await api.get('/api/v1/admin/users', {
      params: { 
        page: 0, 
        size: 200
      }
    });
    
    const users = usersResponse.data.data.content;
    
    // 2. 활성 사용자 통계 조회 (새로운 API 사용)
    const activeStatsResponse = await api.get('/api/v1/admin/attendance/active-stats');
    const activeStats = activeStatsResponse.data.data;
    
    // 통계 계산
    const totalUsers = users.length;
    const activeUsers = activeStats.activeUsers;

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
    
    // 권한별 분포
    const roleDistribution = users.reduce((acc, user) => {
      const role = user.role;
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalUsers,
      activeUsers,
      levelDistribution,
      pointDistribution: pointRanges,
      roleDistribution,
      users,
      activeUserRate: activeStats.activeUserRate,
      baseDate: activeStats.baseDate
    };
  } catch (error) {
    console.error('사용자 통계 조회 실패:', error);
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
 * 월별 가입자 통계 조회
 */
export const getMonthlyRegistrationStats = async () => {
  try {
    const response = await api.get('/api/v1/admin/users/monthly-stats');
    return response.data.data;
  } catch (error) {
    console.error('월별 가입자 통계 조회 실패:', error);
    throw error;
  }
};