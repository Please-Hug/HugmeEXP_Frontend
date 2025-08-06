import React, { useState, useEffect, useRef } from "react";
import styles from "./RecruitmentFilter.module.scss";
import { FaChevronDown } from "react-icons/fa";
import { DropdownPortal } from "./";
import { ExperienceRangeSlider } from "./";
import SalaryFilter from "./SalaryFilter";
import EducationFilter from "./EducationFilter";
import EnhancedSkillSelector from "./EnhancedSkillSelector";
import { educations, salaryLevels, getSalaryKeys } from "../../../constants/recruitmentConstants";

// 필터 옵션 상수들은 공유 상수 파일에서 가져옴
const salaryKeys = getSalaryKeys();

function RecruitmentFilter({
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

  // Salary slider is now handled in SalaryFilter component

  const getExperienceButtonText = () => {
    if (Array.isArray(experience)) {
      if (experience[0] === -1 && experience[1] === 10) return "경력";
      if (experience[0] === -1) return "경력무관";
      if (experience[0] === experience[1]) {
        return experience[0] === 0 ? "신입" : `${experience[0]}년`;
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
      case "experience":
        content = (
          <ExperienceRangeSlider
            experience={experience}
            onExperienceChange={onExperienceChange}
            closeDropdown={closeDropdown}
          />
        );
        break;
      case "education":
        content = (
          <EducationFilter
            education={education}
            onEducationChange={onEducationChange}
            closeDropdown={closeDropdown}
          />
        );
        break;
      case "salary":
        content = (
          <SalaryFilter
            salary={salary}
            onSalaryChange={onSalaryChange}
            closeDropdown={closeDropdown}
          />
        );
        break;
      case "skills":
        content = (
          <EnhancedSkillSelector
            selectedSkills={selectedSkills}
            onSkillChange={onSkillChange}
            closeDropdown={closeDropdown}
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

      {/* 경력 필터 */}
      <div className={styles.filterGroup}>
        <button
          className={getButtonClass(
            Array.isArray(experience) &&
              (experience[0] !== -1 || experience[1] !== 10)
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
