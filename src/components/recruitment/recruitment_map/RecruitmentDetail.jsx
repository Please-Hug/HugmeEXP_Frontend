import React, { useState, useEffect } from "react";
import styles from "./RecruitmentDetail.module.scss";
import { getRecruitmentDetail } from "../../../api/recruitmentService";
import { iconDefinitions } from "../../../constants/recruitmentConstants";

// 기술 스택 아이콘은 공유 상수 파일에서 가져옴

const RecruitmentDetail = ({ job, onClose }) => {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 이전에 불러온 작업 상세 데이터를 캐싱하기 위한 ref
  const jobDetailsCache = React.useRef({});

  useEffect(() => {
    if (!job || !job.id) {
      setDetailData(null);
      return;
    }

    // 이미 해당 ID에 대한 상세 정보를 불러왔는지 확인
    if (jobDetailsCache.current[job.id]) {
      console.log(`Job detail for ID ${job.id} already fetched, using cached data`);
      setDetailData(jobDetailsCache.current[job.id]);
      return;
    }

    const fetchJobDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getRecruitmentDetail(job.id);
        setDetailData(data);
        // 성공적으로 불러온 데이터를 캐시에 저장
        jobDetailsCache.current[job.id] = data;
      } catch (err) {
        console.error(`Error fetching job detail for ID ${job.id}:`, err);
        setError("상세 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [job?.id]); // job 전체가 아닌 job.id만 의존성으로 지정

  // 마감일 표시 형식을 결정하는 함수
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const dueDateObj = new Date(dueDate);
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    
    // 마감일이 1년 이상 남았으면 '상시 모집'으로 표시
    return dueDateObj > oneYearFromNow ? 
      '상시 모집' : 
      `마감일: ${dueDateObj.toLocaleDateString('ko-KR')}`;
  };

  if (!job) {
    return null;
  }

  // 기본 정보는 job에서 가져오고, 상세 정보는 detailData에서 가져옵니다
  const displayData = detailData || job;
  
  // 경력 표시 함수
  const formatExperience = (min, max) => {
    if (min === 0 && max === 0) return '신입';
    if (min === 0) return `신입~${max}년`;
    if (max === null || max === undefined) return `${min}년 이상`;
    if (min === max) return `${min}년`;
    return `${min}~${max}년`;
  };

  // 학력 표시 함수
  const formatEducation = (education) => {
    switch (education) {
      case 0: return '학력 무관';
      case 10: return '고졸';
      case 20: return '전문대졸';
      case 30: return '대졸';
      case 40: return '석사';
      case 50: return '박사';
      default: return '학력 무관';
    }
  };

  // 급여 표시 함수
  const formatSalary = (min, max) => {
    if (!min && !max) return '회사 내규에 따름';
    if (min && !max) return `${min}만원 이상`;
    if (min === max) return `${min}만원`;
    return `${min}~${max}만원`;
  };

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} onClick={onClose}>
        X
      </button>
      
      {loading && (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          상세 정보를 불러오는 중...
        </div>
      )}
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <p>기본 정보만 표시합니다.</p>
        </div>
      )}
      
      {!loading && !error && (
        <>
          <div className={styles.header}>
            <div className={styles.companyInfo}>
              {displayData.companyImageUrl && (
                <div className={styles.companyImageContainer}>
                  <img 
                    src={displayData.companyImageUrl} 
                    alt={`${displayData.companyName || displayData.company} 로고`} 
                    className={styles.companyImage} 
                    onError={(e) => {
                      // 이미지 로드 오류 발생 시 이미지 요소 자체를 제거
                      e.target.style.display = 'none';
                      // 부모 컨테이너도 숨김
                      e.target.parentNode.style.display = 'none';
                      // 추가 오류 핸들링 방지
                      e.target.onerror = null;
                    }}
                  />
                </div>
              )}
              
              <div className={styles.companyDetails}>
                <div className={styles.titleWrapper}>
                  <h2>{displayData.title}</h2>
                  {displayData.link && (
                    <a
                      href={displayData.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkButton}
                    >
                      공고 바로가기
                    </a>
                  )}
                </div>
                <h3>{displayData.companyName || displayData.company}</h3>
                <p>{displayData.companyAddress || displayData.address}</p>
              </div>
            </div>
            
            {displayData.dueDate && (
              <div className={styles.dueDateBadge}>
                {formatDueDate(displayData.dueDate)}
              </div>
            )}
          </div>
          
          <div className={styles.body}>
            {/* 경력 정보 */}
            <section>
              <h4>경력</h4>
              <p>
                {displayData.experienceMin != null && displayData.experienceMax != null
                  ? formatExperience(displayData.experienceMin, displayData.experienceMax)
                  : '경력 정보 없음'}
              </p>
            </section>
            
            {/* 학력 정보 */}
            
              <section>
                <h4>학력</h4>
                {displayData.education != null && (
                <p>{formatEducation(displayData.education)}</p>
                )}
              </section>
            
            {/* 급여 정보 */}
            {(displayData.salaryMin != null || displayData.salaryMax != null) && (
              <section>
                <h4>급여</h4>
                <p>{formatSalary(displayData.salaryMin, displayData.salaryMax)}</p>
              </section>
            )}
            
            {/* 자격요건 */}
            {displayData.qualifications && (
              <section>
                <h4>자격요건</h4>
                <p>{displayData.qualifications}</p>
              </section>
            )}
            
            {/* 우대사항 */}
            {displayData.advantage && (
              <section>
                <h4>우대사항</h4>
                <p>{displayData.advantage}</p>
              </section>
            )}
            
            {/* 복지 혜택 */}
            {displayData.welfare && (
              <section>
                <h4>복지 및 혜택</h4>
                <p>{displayData.welfare}</p>
              </section>
            )}
            
            {/* 회사 설명 */}
            {displayData.companyDescription && (
              <section>
                <h4>회사 소개</h4>
                <p>{displayData.companyDescription}</p>
              </section>
            )}
            
            {/* 회사 설립연도 */}
            {(displayData.establishmentDate || displayData.establishmentYear) && (
              <section>
                <h4>회사 설립연도</h4>
                <p>
                  {displayData.establishmentDate
                    ? new Date(displayData.establishmentDate).getFullYear() + '년'
                    : displayData.establishmentYear + '년'}
                </p>
              </section>
            )}
            
           
            
            {/* 기술 스택 */}
            {(displayData.techStacks || displayData.skills) && (
              <section>
                <h4>기술 스택</h4>
                <div className={styles.skills}>
                  {displayData.techStacks
                    ? displayData.techStacks.map((tech, index) => {
                        const techName = tech.labelKo || tech.labelEn || tech.name;
                        const normalizedName = techName.toLowerCase();
                        
                        // 대소문자 구분 없이 아이콘 찾기
                        const iconKey = Object.keys(iconDefinitions).find(
                          key => key.toLowerCase() === normalizedName
                        );
                        const iconInfo = iconKey ? iconDefinitions[iconKey] : null;
                        
                        return (
                          <span key={index} className={styles.skillTag}>
                            {iconInfo && (
                              <span className={styles.skillIcon}>
                                {React.createElement(iconInfo.component, { color: iconInfo.color })}
                              </span>
                            )}
                            {techName}
                          </span>
                        );
                      })
                    : displayData.skills.map((skill, index) => {
                        const normalizedSkill = skill.toLowerCase();
                        
                        // 대소문자 구분 없이 아이콘 찾기
                        const iconKey = Object.keys(iconDefinitions).find(
                          key => key.toLowerCase() === normalizedSkill
                        );
                        const iconInfo = iconKey ? iconDefinitions[iconKey] : null;
                        
                        return (
                          <span key={index} className={styles.skillTag}>
                            {iconInfo && (
                              <span className={styles.skillIcon}>
                                {React.createElement(iconInfo.component, { color: iconInfo.color })}
                              </span>
                            )}
                            {skill}
                          </span>
                        );
                      })}
                </div>
              </section>
            )}
            
            {/* 태그 */}
            {displayData.tags && displayData.tags.length > 0 && (
              <section>
                <h4>태그</h4>
                <div className={styles.tags}>
                  {displayData.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag.tagName}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RecruitmentDetail;
