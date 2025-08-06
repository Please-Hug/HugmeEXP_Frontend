import React, { useState, useEffect } from "react";
import styles from "./RecruitmentFilter.module.scss";
import { educations } from "../../../constants/recruitmentConstants";

const EducationFilter = ({ education, onEducationChange, closeDropdown }) => {
  // State for temporary education value (only update parent on apply)
  const [tempEducation, setTempEducation] = useState(education);
  
  // Update local state when parent props change
  useEffect(() => {
    setTempEducation(education);
  }, [education]);
  
  // Apply changes to parent component
  const handleApply = () => {
    onEducationChange(tempEducation);
    closeDropdown(); // Close dropdown after applying changes
  };
  
  // Reset to default value
  const handleReset = () => {
    setTempEducation(0); // Reset to default value
    onEducationChange(0); // Also update parent
  };

  return (
    <div className={styles.dropdownMenu}>
      {Object.entries(educations).map(([key, value]) => (
        <div
          key={key}
          className={`${styles.dropdownItem} ${Number(key) === tempEducation ? styles.selected : ''}`}
          onClick={() => setTempEducation(Number(key))}
        >
          {value}
        </div>
      ))}
      <div className={styles.buttonContainer} style={{ padding: "0.5rem" }}>
        <button className={styles.resetButton} onClick={handleReset}>초기화</button>
        <button className={styles.applyButton} onClick={handleApply}>적용</button>
      </div>
    </div>
  );
};

export default EducationFilter;
