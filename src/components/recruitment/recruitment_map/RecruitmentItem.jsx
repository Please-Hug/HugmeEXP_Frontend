import React from 'react';
import styles from './RecruitmentItem.module.scss';

function RecruitmentItem({ job, isSelected, onSelectJob }) {
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
      <h4 className={styles.jobTitle}>{job.title}</h4>
      <p className={styles.jobCompany}>{job.companyName || job.company}</p>
      <p className={styles.jobAddress}>{job.workLocation || job.address}</p>
      <p className={styles.jobExperience}>경력: {experienceText}</p>
      <div className={styles.skillsContainer}>
        {job.skills && job.skills.slice(0, 4).map((skill, index) => (
          <span key={index} className={styles.skillTag}>{skill}</span>
        ))}
      </div>
    </div>
  );
}

export default RecruitmentItem;
