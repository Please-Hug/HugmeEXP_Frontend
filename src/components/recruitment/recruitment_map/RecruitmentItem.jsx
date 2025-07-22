import React from 'react';
import styles from './RecruitmentItem.module.scss';

function RecruitmentItem({ job, isSelected, onSelectJob }) {
  const jobItemClasses = `${styles.jobItem} ${isSelected ? styles.selectedJobItem : ''}`;

  // Mock data for experience mapping if not available directly in job object
  const experienceMap = {
    'all': '경력 무관',
    'new': '신입',
    '1': '1년 이상',
    '3': '3년 이상',
    '5': '5년 이상',
  };

  return (
    <div
      onClick={() => onSelectJob(job)}
      className={jobItemClasses}
    >
      <h4 className={styles.jobTitle}>{job.title}</h4>
      <p className={styles.jobCompany}>{job.company}</p>
      <p className={styles.jobAddress}>{job.address}</p>
      <p className={styles.jobExperience}>경력: {experienceMap[job.experience] || job.experience}</p>
      <div className={styles.skillsContainer}>
        {job.skills && job.skills.slice(0, 4).map((skill, index) => (
          <span key={index} className={styles.skillTag}>{skill}</span>
        ))}
      </div>
    </div>
  );
}

export default RecruitmentItem;
