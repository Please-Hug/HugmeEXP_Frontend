import React, { useEffect, useRef, useCallback } from "react";
import styles from "./RecruitmentList.module.scss";
import RecruitmentItem from "./RecruitmentItem";

function RecruitmentList({ jobs, selectedJob, onSelectJob, onLoadMore, isLoading, isLastPage }) {
  const observerRef = useRef(null); // Intersection Observer 참조
  const loadingRef = useRef(null); // 로딩 요소 참조
  
  // 스크롤 감지 콜백 함수
  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    // 로딩 요소가 화면에 보이고, 추가 로딩 중이 아니며, 마지막 페이지가 아닌 경우
    if (entry.isIntersecting && !isLoading && !isLastPage) {
      // 추가 데이터 로드 요청
      onLoadMore();
    }
  }, [onLoadMore, isLoading, isLastPage]);
  
  // Intersection Observer 설정
  useEffect(() => {
    // 이전 Observer 해제
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // 새 Observer 생성
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null, // viewport 기준
      rootMargin: '0px',
      threshold: 0.1 // 10% 이상 보이면 콜백 실행
    });
    
    // 로딩 요소 관찰 시작
    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }
    
    // 컴포넌트 언마운트 시 Observer 해제
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, jobs]);
  
  return (
    <div className={styles.listContainer}>
      {Array.isArray(jobs) && jobs.map((job, index) => (
        <RecruitmentItem
          key={job.id || index} // ID가 있으면 ID 사용, 없으면 인덱스 사용
          job={job}
          isSelected={selectedJob === job}
          onSelectJob={onSelectJob}
        />
      ))}
      
      {/* 로딩 상태 표시 및 Intersection Observer 타겟 */}
      <div ref={loadingRef} className={styles.loadingContainer}>
        {isLoading && <div className={styles.loadingSpinner}>로딩 중...</div>}
        {isLastPage && jobs.length > 0 && <div className={styles.endMessage}>모든 채용 공고를 불러왔습니다.</div>}
        {!isLoading && jobs.length === 0 && <div className={styles.noResults}>검색 결과가 없습니다.</div>}
      </div>
    </div>
  );
}

export default RecruitmentList;
