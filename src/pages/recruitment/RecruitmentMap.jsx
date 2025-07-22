import React, { useState } from "react";
import RecruitmentMapHeader from "../../components/recruitment/recruitment_map/RecruitmentPageHeader";
import RecruitmentList from "../../components/recruitment/recruitment_map/RecruitmentList";
import MapContainer from "../../components/recruitment/recruitment_map/MapContainer";
// import { jobs } from "../mocks/jobs";

import RecruitmentFilter from "../../components/recruitment/recruitment_map/RecruitmentFilter";
import styles from "./RecruitmentMap.module.scss";

const jobs = [
  {
    title: "서버 백엔드 개발[신입]",
    company: "goorm",
    lat: 37.504897,
    lng: 127.049611,
    type: "backend",
    region: "seoul",
    salary: 3500,
    experience: "신입",
    skills: ["Python", "AWS", "git"],
    education: 30,
  },
  {
    title: "프론트엔드 개발자 (React)",
    company: "네이버",
    lat: 37.3595704,
    lng: 127.105399,
    type: "frontend",
    region: "bundang",
    salary: 4500,
    experience: "경력",
    skills: ["javascript", "html", "AWS"],
    education: 30,
  },
  {
    title: "UI/UX 디자이너",
    company: "카카오",
    lat: 37.402056,
    lng: 127.108212,
    type: "designer",
    region: "bundang",
    salary: 6500,
    experience: "경력",
    skills: ["git"],
    education: 20,
  },
  {
    title: "안드로이드 개발자 (경력)",
    company: "배달의민족",
    lat: 37.5015396,
    lng: 127.0410122,
    type: "mobile",
    region: "seoul",
    salary: 2800,
    experience: "인턴",
    skills: ["Android", "Kotlin"],
    education: 10,
  },
];

function RecruitmentMapPage() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [salary, setSalary] = useState(0);
  const [experience, setExperience] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [education, setEducation] = useState(0);

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
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };
  const handleEducationChange = (value) => setEducation(parseInt(value, 10));

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

    const experienceMatch = experience === "all" || job.experience === experience;

    const skillsMatch =
      selectedSkills.length === 0 ||
      selectedSkills.every((skill) => job.skills.includes(skill));

    const educationMatch = education === 0 || job.education <= education;

    return (
      typeMatch &&
      regionMatch &&
      salaryMatch() &&
      experienceMatch &&
      skillsMatch &&
      educationMatch
    );
  });

  return (
    <div className={styles.container}>
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
      />
      <main className={styles.main}>
        <RecruitmentList
          jobs={filteredJobs}
          selectedJob={selectedJob}
          onSelectJob={handleSelectJob}
        />
        <MapContainer
          jobs={filteredJobs}
          selectedJob={selectedJob}
          onSelectJob={handleSelectJob}
        />
      </main>
    </div>
  );
}

export default RecruitmentMapPage;
