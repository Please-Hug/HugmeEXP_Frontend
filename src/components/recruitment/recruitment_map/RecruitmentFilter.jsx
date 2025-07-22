import React, { useState, useRef, useEffect } from "react";
import styles from "./RecruitmentFilter.module.scss";
import {
  FaPython,
  FaAws,
  FaGitAlt,
  FaHtml5,
  FaJs,
  FaLinux,
  FaAndroid,
  FaApple,
}
from "react-icons/fa";
import { SiSpring, SiMysql, SiKotlin } from "react-icons/si";

const skills = [
  { name: "Python", icon: <FaPython color="#4B8BBE" /> },
  { name: "Spring", icon: <SiSpring color="#6DB33F" /> },
  { name: "AWS", icon: <FaAws color="#FF9900" /> },
  { name: "git", icon: <FaGitAlt color="#F05032" /> },
  { name: "iOS", icon: <FaApple color="#A2AAAD" /> },
  { name: "html", icon: <FaHtml5 color="#E34F26" /> },
  { name: "javascript", icon: <FaJs color="#F7DF1E" /> },
  { name: "mysql", icon: <SiMysql color="#4479A1" /> },
  { name: "Linux", icon: <FaLinux color="#000000" /> },
  { name: "Android", icon: <FaAndroid color="#3DDC84" /> },
  { name: "Kotlin", icon: <SiKotlin color="#7F52FF" /> },
];

const salaryLevels = {
  0: "회사 내규에 따름",
  3000: "3000 ~ 4000",
  4000: "4000 ~ 5000",
  6000: "6000 이상",
};



function RecruitmentFilter({
  onFilterChange,
  filterType,
  onRegionFilterChange,
  regionFilter,
  salary,
  onSalaryChange,
  experience,
  onExperienceChange,
  selectedSkills,
  onSkillChange,
  education,
  onEducationChange,
}) {
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const [isSalaryDropdownOpen, setIsSalaryDropdownOpen] = useState(false);
  const skillsFilterRef = useRef(null);
  const salaryFilterRef = useRef(null);

  const handleSalarySliderChange = (e) => {
    const value = e.target.value;
    const salaryValue = Object.keys(salaryLevels)[value];
    onSalaryChange(salaryValue);
  };

  // 외부 클릭 감지 로직을 함수로 분리
  const useOutsideAlerter = (ref, close) => {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          close();
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref, close]);
  }

  // 각 드롭다운에 외부 클릭 감지 적용
  useOutsideAlerter(skillsFilterRef, () => setIsSkillsDropdownOpen(false));
  useOutsideAlerter(salaryFilterRef, () => setIsSalaryDropdownOpen(false));

  return (
    <div className={styles.filterContainer}>
      {/* 직무 필터 */}
      <div className={styles.filterGroup}>
        <label className={styles.label}>직무</label>
        <select
          value={filterType}
          onChange={(e) => onFilterChange(e.target.value)}
          className={styles.select}
        >
          <option value="all">전체</option>
          <option value="frontend">프론트엔드</option>
          <option value="backend">백엔드</option>
          <option value="designer">디자이너</option>
          <option value="mobile">모바일</option>
        </select>
      </div>

      {/* 지역 필터 */}
      <div className={styles.filterGroup}>
        <label className={styles.label}>지역</label>
        <select
          value={regionFilter}
          onChange={(e) => onRegionFilterChange(e.target.value)}
          className={styles.select}
        >
          <option value="all">전체</option>
          <option value="seoul">서울</option>
          <option value="bundang">분당</option>
        </select>
      </div>

      {/* 경력 필터 */}
      <div className={styles.filterGroup}>
        <label className={styles.label}>경력</label>
        <select
          value={experience}
          onChange={(e) => onExperienceChange(e.target.value)}
          className={styles.select}
        >
          <option value="all">전체</option>
          <option value="신입">신입</option>
          <option value="인턴">인턴</option>
          <option value="경력">경력</option>
        </select>
      </div>

      {/* 학력 필터 */}
      <div className={styles.filterGroup}>
        <label className={styles.label}>학력</label>
        <select
          value={education}
          onChange={(e) => onEducationChange(e.target.value)}
          className={styles.select}
        >
          <option value={0}>무관</option>
          <option value={10}>고졸</option>
          <option value={20}>초대졸</option>
          <option value={30}>대졸</option>
          <option value={40}>석사</option>
          <option value={50}>박사</option>
        </select>
      </div>

      {/* 연봉 필터 */}
      <div className={`${styles.filterGroup} ${styles.salaryFilter}`} ref={salaryFilterRef}>
        <button 
          className={styles.salaryButton}
          onClick={() => setIsSalaryDropdownOpen(!isSalaryDropdownOpen)}
        >
          연봉: {salaryLevels[salary]}
        </button>
        {isSalaryDropdownOpen && (
           <div className={styles.salaryDropdown}>
             <input
               type="range"
               min="0"
               max="3"
               step="1"
               value={Object.keys(salaryLevels).indexOf(String(salary))}
               onChange={handleSalarySliderChange}
               className={styles.slider}
             />
             <span className={styles.salaryValue}>{salaryLevels[salary]}</span>
           </div>
        )}
      </div>

      {/* 기술 스택 필터 */}
      <div className={`${styles.filterGroup} ${styles.skillsFilter}`} ref={skillsFilterRef}>
        <button 
          className={styles.skillsButton}
          onClick={() => setIsSkillsDropdownOpen(!isSkillsDropdownOpen)}
        >
          기술 스택 {selectedSkills.length > 0 && `(${selectedSkills.length})`}
        </button>
        {isSkillsDropdownOpen && (
          <div className={styles.skillsDropdown}>
            {skills.map((skill) => (
              <div key={skill.name} className={styles.skillTag}>
                <input
                  type="checkbox"
                  id={`skill-${skill.name}`}
                  checked={selectedSkills.includes(skill.name)}
                  onChange={() => onSkillChange(skill.name)}
                />
                <label htmlFor={`skill-${skill.name}`}>
                  {skill.icon}
                  {skill.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruitmentFilter;
