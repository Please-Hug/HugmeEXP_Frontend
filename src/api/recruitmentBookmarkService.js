// src/api/recruitmentBookmarkService.js
import api from "./axiosInstance";

/**
 * 채용공고 즐겨찾기 추가
 * POST /api/v1/recruitments/bookmarks/{recruitmentId}
 */
export function addRecruitmentBookmark(recruitmentId) {
  return api.post(`/api/v1/recruitments/bookmarks/${recruitmentId}`)
    .then(res => res.data)
    .catch(error => {
      console.error('채용공고 즐겨찾기 추가 실패:', error);
      throw error;
    });
}

/**
 * 채용공고 즐겨찾기 삭제
 * DELETE /api/v1/recruitments/bookmarks/{recruitmentId}
 */
export function removeRecruitmentBookmark(recruitmentId) {
  return api.delete(`/api/v1/recruitments/bookmarks/${recruitmentId}`)
    .then(res => res.data)
    .catch(error => {
      console.error('채용공고 즐겨찾기 삭제 실패:', error);
      throw error;
    });
}


/**
 * 사용자의 모든 채용공고 즐겨찾기 목록 조회
 * GET /api/v1/recruitments/bookmarks
 */
export async function getUserRecruitmentBookmarks() {


  try {
    const response = await api.get("/api/v1/recruitments/bookmarks");
    console.log("response",response);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching recruitment filters:", error);
    throw error;
  }
}
