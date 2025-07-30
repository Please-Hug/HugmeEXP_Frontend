import React, { useState, useEffect, useRef } from "react";
import styles from "./RecruitmentFilter.module.scss";
import { FaChevronDown } from "react-icons/fa";
import { DropdownPortal } from "./";
import { ExperienceRangeSlider } from "./";
import { SkillSelector } from "./";

// Constants for filter options
const jobTypes = {
  all: "직무",
  frontend: "프론트엔드",
  backend: "백엔드",
  designer: "디자이너",
  mobile: "모바일",
};

const regions = {
  all: "지역",
  seoul: "서울",
  bundang: "분당",
};

const educations = {
  0: "학력",
  10: "고졸",
  20: "초대졸",
  30: "대졸",
  40: "석사",
  50: "박사",
};

const salaryLevels = {
  0: "회사 내규에 따름",
  3000: "3000 ~ 4000",
  4000: "4000 ~ 5000",
  5000: "5000 ~ 6000",
  6000: "6000 이상",
};

const salaryKeys = Object.keys(salaryLevels)
  .map(Number)
  .sort((a, b) => a - b);

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
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const filterContainerRef = useRef(null);

  // Hook to close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(event.target)
      ) {
        const dropdownRoot = document.getElementById("dropdown-root");
        if (dropdownRoot && !dropdownRoot.contains(event.target)) {
          setActiveDropdown(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownToggle = (dropdownName, event) => {
    event.stopPropagation();
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
      });
      setActiveDropdown(dropdownName);
    }
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  const handleSalarySliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    const salaryValue = salaryKeys[value];
    onSalaryChange(salaryValue);
  };

  const getExperienceButtonText = () => {
    if (Array.isArray(experience)) {
      if (experience[0] === -1) return "경력무관";
      console.log("experience", experience);
      if (experience[0] === experience[1]) {
        return experience[0] === 0 ? "경력무관" : `${experience[0]}년`;
      }
      return `${experience[0] === 0 ? "신입" : `${experience[0]}년`} ~ ${experience[1]}년`;
    }
    return "경력";
  };

  const getButtonClass = (isActive) =>
    `${styles.filterButton} ${isActive ? styles.active : ""}`;

  const renderDropdownContent = () => {
    if (!activeDropdown) return null;

    let content;
    switch (activeDropdown) {
      case "jobType":
        content = (
          <div className={styles.dropdownMenu}>
            {Object.entries(jobTypes).map(([key, value]) => (
              <div
                key={key}
                className={styles.dropdownItem}
                onClick={() => {
                  onFilterChange(key);
                  closeDropdown();
                }}
              >
                {value}
              </div>
            ))}
          </div>
        );
        break;
      case "region":
        content = (
          <div className={styles.dropdownMenu}>
            {Object.entries(regions).map(([key, value]) => (
              <div
                key={key}
                className={styles.dropdownItem}
                onClick={() => {
                  onRegionFilterChange(key);
                  closeDropdown();
                }}
              >
                {value}
              </div>
            ))}
          </div>
        );
        break;
      case "experience":
        content = (
          <div className={styles.dropdownMenu}>
            <ExperienceRangeSlider
              experience={experience}
              onExperienceChange={onExperienceChange}
            />
          </div>
        );
        break;
      case "education":
        content = (
          <div className={styles.dropdownMenu}>
            {Object.entries(educations).map(([key, value]) => (
              <div
                key={key}
                className={styles.dropdownItem}
                onClick={() => {
                  onEducationChange(Number(key));
                  closeDropdown();
                }}
              >
                {value}
              </div>
            ))}
          </div>
        );
        break;
      case "salary":
        content = (
          <div
            className={styles.dropdownMenu}
            style={{ padding: "1rem", width: "250px" }}
          >
            <input
              type="range"
              min="0"
              max={salaryKeys.length - 1}
              step="1"
              value={Math.max(0, salaryKeys.indexOf(salary))}
              onChange={handleSalarySliderChange}
              className={styles.slider}
            />
            <div className={styles.salaryValue}>{salaryLevels[salary]}</div>
          </div>
        );
        break;
      case "skills":
        content = (
          <SkillSelector
            selectedSkills={selectedSkills}
            onSkillChange={onSkillChange}
          />
        );
        break;
      default:
        content = null;
    }
    return (
      <DropdownPortal position={dropdownPosition}>{content}</DropdownPortal>
    );
  };

  return (
    <div className={styles.filterContainer} ref={filterContainerRef}>
      {/* 직무 필터 */}
      <div className={styles.filterGroup}>
        <button
          className={getButtonClass(filterType !== "all")}
          onClick={(e) => handleDropdownToggle("jobType", e)}
        >
          {jobTypes[filterType] || "직무"}
        </button>
      </div>

      {/* 지역 필터 */}
      <div className={styles.filterGroup}>
        <button
          className={getButtonClass(regionFilter !== "all")}
          onClick={(e) => handleDropdownToggle("region", e)}
        >
          {regions[regionFilter] || "지역"}
        </button>
      </div>

      {/* 경력 필터 */}
      <div className={styles.filterGroup}>
        <button
          className={getButtonClass(
            Array.isArray(experience) &&
              (experience[0] !== 0 || experience[1] !== 10)
          )}
          onClick={(e) => handleDropdownToggle("experience", e)}
        >
          {getExperienceButtonText()}
        </button>
      </div>

      {/* 학력 필터 */}
      <div className={styles.filterGroup}>
        <button
          className={getButtonClass(education !== 0)}
          onClick={(e) => handleDropdownToggle("education", e)}
        >
          {educations[education] || "학력"}
        </button>
      </div>

      {/* 연봉 필터 */}
      <div className={styles.filterGroup}>
        <button
          className={getButtonClass(salary > 0)}
          onClick={(e) => handleDropdownToggle("salary", e)}
        >
          {salary > 0 ? `연봉: ${salaryLevels[salary]}` : "연봉"}
        </button>
      </div>

      {/* 기술 스택 필터 */}
      <div className={styles.filterGroup}>
        <button
          className={getButtonClass(selectedSkills.length > 0)}
          onClick={(e) => handleDropdownToggle("skills", e)}
        >
          기술 스택 {selectedSkills.length > 0 && `(${selectedSkills.length})`}
        </button>
      </div>

      {renderDropdownContent()}
    </div>
  );
}

export default RecruitmentFilter;
