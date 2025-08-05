import React from "react";
import styles from "./RecruitmentList.module.scss";
import RecruitmentItem from "./RecruitmentItem";

function RecruitmentList({ jobs, selectedJob, onSelectJob }) {
  console.log("jobs length", jobs.length);
  return (
    <div className={styles.listContainer}>
      {Array.isArray(jobs) && jobs.map((job, index) => (
        <RecruitmentItem
          key={index}
          job={job}
          isSelected={selectedJob === job}
          onSelectJob={onSelectJob}
        />
      ))}
    </div>
  );
}

export default RecruitmentList;
