import React from 'react';
import styles from './RecruitmentItem.module.scss';
import wantedLogo from '../../../assets/logos/wanted_logo.png';
import jumpitLogo from '../../../assets/logos/jumpit_logo.png';
import { FaRegBookmark, FaBookmark } from 'react-icons/fa6';
import { useBookmark } from '../../../contexts/BookmarkContext';

function RecruitmentItem({ job, isSelected, onSelectJob, isBookmarked }) {
  // Context API를 통한 즐겨찾기 관리
  const { toggleBookmark, isLoading } = useBookmark();
  
  // 즐겨찾기 토글 함수
  const handleToggleBookmark = (e) => {
    e.stopPropagation(); // 부모 요소의 클릭 이벤트 전파 방지
    
    if (!job?.id) return;
    
    toggleBookmark(job.id);
  };
  const jobItemClasses = `${styles.jobItem} ${isSelected ? styles.selectedJobItem : ''}`;

  // 경력 표시 함수
  const formatExperience = (min, max) => {
    if (min === 0 && max === 0) return '신입';
    if (min === 0) return `신입~${max}년`;
    if (max === null || max === undefined) return `${min}년 이상`;
    if (min === max) return `${min}년`;
    return `${min}~${max}년`;
  };

  // 경력 정보 가져오기
  const experienceText = job.experienceMin != null && job.experienceMax != null
    ? formatExperience(job.experienceMin, job.experienceMax)
    : '경력 정보 없음';

  return (
    <div
      onClick={() => onSelectJob(job)}
      className={jobItemClasses}
    >
      <div className={styles.titleContainer}>
        <div className={styles.titleBookmarkWrapper}>
          <h4 className={styles.jobTitle}>{job.title}</h4>
          <button 
            className={styles.bookmarkButton} 
            onClick={handleToggleBookmark}
            disabled={isLoading}
            aria-label={isBookmarked ? '즐겨찾기 삭제' : '즐겨찾기 추가'}
          >
            {isBookmarked ? <FaBookmark className={styles.bookmarkIcon} /> : <FaRegBookmark className={styles.bookmarkIcon} />}
          </button>
        </div>
       
      </div>
      <p className={styles.jobCompany}>{job.companyName || job.company}</p>
      <p className={styles.jobAddress}>{job.workLocation || job.address}</p>
      <p className={styles.jobExperience}>경력: {experienceText}</p>
      <div className={styles.skillsContainer}>
        {job.skills && job.skills.slice(0, 4).map((skill, index) => (
          <span key={index} className={styles.skillTag}>{skill}</span>
        ))}
      </div>
      {job.recruitmentSourceId && (
          <div className={styles.sourceLogoContainer}>
            {job.recruitmentSourceId.includes('wanted') && (
              <img src={wantedLogo} alt="Wanted" className={styles.sourceLogo} />
            )}
            {job.recruitmentSourceId.includes('jumpit') && (
              <img src={jumpitLogo} alt="Jumpit" className={styles.sourceLogo} />
            )}
          </div>
        )}
    </div>
  );
}

export default RecruitmentItem;
