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
} from "react-icons/fa";
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
  5000: "5000 ~ 6000",
  6000: "6000 이상",
};

const salaryKeys = Object.keys(salaryLevels).map(Number).sort((a, b) => a - b);

const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return { isOpen, setIsOpen, ref };
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
  onSearch,
}) {
  const jobTypeDropdown = useDropdown();
  const regionDropdown = useDropdown();
  const experienceDropdown = useDropdown();
  const educationDropdown = useDropdown();
  const salaryDropdown = useDropdown();
  const skillsDropdown = useDropdown();
  const [keyword, setKeyword] = useState("");

  const handleSalarySliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    const salaryKeys = Object.keys(salaryLevels)
      .map(Number)
      .sort((a, b) => a - b);
    const salaryValue = salaryKeys[value];
    onSalaryChange(salaryValue);
  };

  const handleExperienceSliderChange = (e) => {
    onExperienceChange(parseInt(e.target.value, 10));
  };

  const jobTypes = { all: '직무', frontend: '프론트엔드', backend: '백엔드', designer: '디자이너', mobile: '모바일' };
  const regions = { all: '지역', seoul: '서울', bundang: '분당' };

  const getExperienceButtonText = () => {
    if (experience === 0) return '경력'; // 기본값
    if (experience === 1) return '신입';
    return `${experience - 1}년 이하`;
  };
  const educations = { 0: '학력', 10: '고졸', 20: '초대졸', 30: '대졸', 40: '석사', 50: '박사' };

  const getButtonClass = (isActive) => `${styles.filterButton} ${isActive ? styles.active : ''}`;

  const handleSearchClick = () => {
    onSearch(keyword);
  };

  return (
    <div className={styles.filterContainer}>
      {/* 직무 필터 */}
      <div className={styles.filterGroup} ref={jobTypeDropdown.ref}>
        <button className={getButtonClass(filterType !== 'all')} onClick={() => jobTypeDropdown.setIsOpen(!jobTypeDropdown.isOpen)}>
          {jobTypes[filterType] || '직무'}
        </button>
        {jobTypeDropdown.isOpen && (
          <div className={styles.dropdownMenu}>
            {Object.entries(jobTypes).map(([key, value]) => (
              <div key={key} className={styles.dropdownItem} onClick={() => { onFilterChange(key); jobTypeDropdown.setIsOpen(false); }}>
                {value}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 지역 필터 */}
      <div className={styles.filterGroup} ref={regionDropdown.ref}>
        <button className={getButtonClass(regionFilter !== 'all')} onClick={() => regionDropdown.setIsOpen(!regionDropdown.isOpen)}>
          {regions[regionFilter] || '지역'}
        </button>
        {regionDropdown.isOpen && (
          <div className={styles.dropdownMenu}>
            {Object.entries(regions).map(([key, value]) => (
              <div key={key} className={styles.dropdownItem} onClick={() => { onRegionFilterChange(key); regionDropdown.setIsOpen(false); }}>
                {value}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 경력 필터 */}
      <div className={styles.filterGroup} ref={experienceDropdown.ref}>
        <button className={getButtonClass(experience !== 0)} onClick={() => experienceDropdown.setIsOpen(!experienceDropdown.isOpen)}>
          {getExperienceButtonText()}
        </button>
        {experienceDropdown.isOpen && (
          <div className={styles.dropdownMenu}>
            <div className={styles.experienceSlider}>
              <input
                type="range"
                min="0"
                max="11"
                value={experience}
                onChange={handleExperienceSliderChange}
              />
              <div className={styles.experienceLevels}>
                <span>무관</span>
                <span>신입</span>
                <span>2년</span>
                <span>4년</span>
                <span>6년</span>
                <span>8년</span>
                <span>10년</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 학력 필터 */}
      <div className={styles.filterGroup} ref={educationDropdown.ref}>
        <button className={getButtonClass(education !== 0)} onClick={() => educationDropdown.setIsOpen(!educationDropdown.isOpen)}>
          {educations[education] || '학력'}
        </button>
        {educationDropdown.isOpen && (
          <div className={styles.dropdownMenu}>
            {Object.entries(educations).map(([key, value]) => (
              <div key={key} className={styles.dropdownItem} onClick={() => { onEducationChange(key); educationDropdown.setIsOpen(false); }}>
                {value}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 연봉 필터 */}
      <div className={styles.filterGroup} ref={salaryDropdown.ref}>
        <button className={getButtonClass(salary > 0)} onClick={() => salaryDropdown.setIsOpen(!salaryDropdown.isOpen)}>
          {salary > 0 ? `연봉: ${salaryLevels[salary]}` : '연봉'}
        </button>
        {salaryDropdown.isOpen && (
          <div className={styles.dropdownMenu} style={{ padding: '1rem', width: '250px' }}>
             <input
               type="range"
               min="0"
               max={salaryKeys.length - 1}
               step="1"
               value={salaryKeys.indexOf(salary)}
               onChange={handleSalarySliderChange}
               className={styles.slider}
             />
             <div className={styles.salaryValue}>{salaryLevels[salary]}</div>
          </div>
        )}
      </div>

      {/* 기술 스택 필터 */}
      <div className={styles.filterGroup} ref={skillsDropdown.ref}>
        <button className={getButtonClass(selectedSkills.length > 0)} onClick={() => skillsDropdown.setIsOpen(!skillsDropdown.isOpen)}>
          기술 스택 {selectedSkills.length > 0 && `(${selectedSkills.length})`}
        </button>
        {skillsDropdown.isOpen && (
          <div className={styles.dropdownMenu} style={{ width: '400px', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem' }}>
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

      {/* 검색창 */}
      <div className={styles.searchGroup}>
        <input
          type="text"
          placeholder="지역, 회사, 키워드 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
          className={styles.searchInput}
        />
        <button onClick={handleSearchClick} className={styles.searchButton}>
          검색
        </button>
      </div>
    </div>
  );
}

export default RecruitmentFilter;
