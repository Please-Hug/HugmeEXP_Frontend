import React from "react";
import styles from "./RecruitmentDetail.module.scss";

const RecruitmentDetail = ({ job, onClose }) => {
  if (!job) {
    return null;
  }

  const {
    id,
    title,
    company,
    address,
    qualifications,
    preferred,
    establishmentYear,
    skills,
  } = job;

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} onClick={onClose}>
        X
      </button>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h2>{title}</h2>
          <a
            href={`/recruitment/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkButton}
          >
            공고 바로가기
          </a>
        </div>
        <h3>{company}</h3>
        <p>{address}</p>
      </div>
      <div className={styles.body}>
        <section>
          <h4>자격요건</h4>
          <p>{qualifications}</p>
        </section>
        <section>
          <h4>우대사항</h4>
          <p>{preferred}</p>
        </section>
        <section>
          <h4>회사 설립연도</h4>
          <p>{establishmentYear}년</p>
        </section>
        <section>
          <h4>기술 스택</h4>
          <div className={styles.skills}>
            {skills.map((skill, index) => (
              <span key={index} className={styles.skillTag}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RecruitmentDetail;
