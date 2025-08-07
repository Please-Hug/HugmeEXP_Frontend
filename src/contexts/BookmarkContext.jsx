import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { addRecruitmentBookmark, removeRecruitmentBookmark, getUserRecruitmentBookmarks } from '../api/recruitmentBookmarkService';

// 북마크 컨텍스트 생성
const BookmarkContext = createContext();

// 북마크 컨텍스트 제공자 컴포넌트
export function BookmarkProvider({ children }) {
  // 즐겨찾기된 채용공고 ID 목록
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  // 초기 즐겨찾기 목록 로드
  useEffect(() => {
    loadBookmarks();
    console.log("bookmarkedJobs",bookmarkedJobs);
  }, []);

  // 즐겨찾기 목록 로드 함수
  const loadBookmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const bookmarks = await getUserRecruitmentBookmarks();
      // 채용공고 ID만 추출하여 Set에 저장
      const bookmarkIds = new Set(bookmarks.map(recruitment => recruitment.id));
      setBookmarkedJobs(bookmarkIds);
    } catch (error) {
      console.error('즐겨찾기 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 즐겨찾기 여부 확인 함수
  const checkBookmarked = useCallback((jobId) => {
    console.log("BookmarkProvider.checkBookmarked",jobId);
    // console.log("bookmarkedJobs",bookmarkedJobs);
    return bookmarkedJobs.has(jobId);
  }, [bookmarkedJobs]);

  // 즐겨찾기 추가 함수
  const addBookmark = useCallback(async (jobId) => {
    try {
      await addRecruitmentBookmark(jobId);
      setBookmarkedJobs(prev => {
        const newSet = new Set(prev);
        newSet.add(jobId);
        return newSet;
      });
      return true;
    } catch (error) {
      console.error('즐겨찾기 추가 실패:', error);
      return false;
    }
  }, []);

  // 즐겨찾기 삭제 함수
  const removeBookmark = useCallback(async (jobId) => {
    try {
      await removeRecruitmentBookmark(jobId);
      setBookmarkedJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      return true;
    } catch (error) {
      console.error('즐겨찾기 삭제 실패:', error);
      return false;
    }
  }, []);

  // 즐겨찾기 토글 함수
  const toggleBookmark = useCallback(async (jobId) => {
    if (bookmarkedJobs.has(jobId)) {
      return removeBookmark(jobId);
    } else {
      return addBookmark(jobId);
    }
  }, [bookmarkedJobs, addBookmark, removeBookmark]);

  // 컨텍스트 값
  const value = {
    bookmarkedJobs,
    isLoading,
    checkBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    refreshBookmarks: loadBookmarks
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}

// 북마크 컨텍스트 사용을 위한 커스텀 훅
export function useBookmark() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmark must be used within a BookmarkProvider');
  }
  return context;
}
