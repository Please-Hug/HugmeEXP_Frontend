import React, { useState } from "react";
import RecruitmentMapHeader from "../../components/recruitment/recruitment_map/RecruitmentPageHeader";
import RecruitmentList from "../../components/recruitment/recruitment_map/RecruitmentList";
import MapContainer from "../../components/recruitment/recruitment_map/MapContainer";

import RecruitmentFilter from "../../components/recruitment/recruitment_map/RecruitmentFilter";
import styles from "./RecruitmentMap.module.scss";
import { jobs } from "../../data/jobs";

function RecruitmentMapPage() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [salary, setSalary] = useState(0);
  const [experience, setExperience] = useState(0); // 0: 경력무관, 1: 신입, 2: 1년 ... 11: 10년
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [education, setEducation] = useState(0);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 }); // 기본 중심: 서울시청


  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setSelectedJob(null);
  };

  const handleRegionFilterChange = (region) => {
    setRegionFilter(region);
    setSelectedJob(null);
  };

  const handleSalaryChange = (value) => setSalary(parseInt(value, 10));
  const handleExperienceChange = (value) => setExperience(value);
  const handleSkillChange = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };
  const handleEducationChange = (value) => setEducation(parseInt(value, 10));

  const handleSearch = (keyword) => {
    if (!keyword.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const { y, x } = data[0];
        setMapCenter({ lat: parseFloat(y), lng: parseFloat(x) });
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert("검색 결과가 없습니다.");
      } else {
        alert("검색 중 오류가 발생했습니다.");
      }
    });
  };

  const filteredJobs = jobs.filter((job) => {
    const typeMatch = filterType === "all" || job.type === filterType;
    const regionMatch = regionFilter === "all" || job.region === regionFilter;

    const salaryMatch = () => {
      if (salary === 0) return true; // '전체' 또는 '회사 내규'는 모든 연봉을 포함
      if (salary === 3000) return job.salary >= 3000 && job.salary < 4000;
      if (salary === 4000) return job.salary >= 4000 && job.salary < 5000;
      if (salary === 6000) return job.salary >= 6000;
      return true;
    };

    const experienceMatch = () => {
      // 사용자가 '경력무관' 선택 시 모든 공고 포함
      if (experience === 0) return true;
      // 공고가 '경력무관'일 경우 항상 포함
      if (job.experience === 'all') return true;

      // '신입' 처리
      const jobIsNew = job.experience === 'new';
      const filterIsNew = experience === 1;
      if (filterIsNew) return jobIsNew;

      // 연차 비교
      const jobExpYear = parseInt(job.experience, 10);
      if (isNaN(jobExpYear)) return jobIsNew; // job.experience가 'new' 같은 문자열일 경우
      
      // 사용자가 설정한 경력(N년 이하)보다 요구 경력이 낮거나 같으면 통과
      return jobExpYear <= (experience - 1);
    };

    const skillsMatch =
      selectedSkills.length === 0 ||
      selectedSkills.every((skill) => job.skills.includes(skill));

    const educationMatch = education === 0 || job.education <= education;

    return (
      typeMatch &&
      regionMatch &&
      salaryMatch() &&
      experienceMatch() &&
      skillsMatch &&
      educationMatch
    );
  });

  return (
    <div className={styles.pageContainer}>
      <RecruitmentMapHeader />
      <RecruitmentFilter
        onFilterChange={handleFilterChange}
        filterType={filterType}
        onRegionFilterChange={handleRegionFilterChange}
        regionFilter={regionFilter}
        salary={salary}
        onSalaryChange={handleSalaryChange}
        experience={experience}
        onExperienceChange={handleExperienceChange}
        selectedSkills={selectedSkills}
        onSkillChange={handleSkillChange}
        education={education}
        onEducationChange={handleEducationChange}
        onSearch={handleSearch}
      />

      <main className={styles.mainContent}>
        <div className={styles.listWrapper}>
          <RecruitmentList
            jobs={filteredJobs}
            selectedJob={selectedJob}
            onSelectJob={handleSelectJob}
          />
        </div>
        <div className={styles.mapWrapper}>
          <MapContainer
            jobs={filteredJobs}
            selectedJob={selectedJob}
            onSelectJob={handleSelectJob}
            mapCenter={mapCenter}
          />
        </div>
      </main>
    </div>
  );
}

export default RecruitmentMapPage;
