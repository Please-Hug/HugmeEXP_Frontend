import React from "react";
import styles from "./RecruitmentList.module.scss";

function RecruitmentList({ jobs, selectedJob, onSelectJob }) {
  return (
    <div className={styles.container}>
      <div className={styles.listContainer}>
        {jobs.map((job, index) => {
          const isSelected = selectedJob === job;
          const jobItemClasses = `${styles.jobItem} ${isSelected ? styles.selectedJobItem : ''}`;

          return (
            <div
              key={index}
              onClick={() => onSelectJob(job)}
              className={jobItemClasses}
            >
              <h4 className={styles.jobTitle}>{job.title}</h4>
              <p className={styles.jobCompany}>{job.company}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecruitmentList;
