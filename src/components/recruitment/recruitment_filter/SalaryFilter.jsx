import React, { useState, useEffect } from "react";
import styles from "./RecruitmentFilter.module.scss";
import { salaryLevels, getSalaryKeys } from "../../../constants/recruitmentConstants";

const salaryKeys = getSalaryKeys();

const SalaryFilter = ({ salary, onSalaryChange }) => {
  // State for temporary salary value (only update parent on apply)
  const [tempSalary, setTempSalary] = useState(salary);
  
  // Update local state when parent props change
  useEffect(() => {
    setTempSalary(salary);
  }, [salary]);
  
  const handleSalarySliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    const salaryValue = salaryKeys[value];
    setTempSalary(salaryValue);
  };
  
  // Apply changes to parent component
  const handleApply = () => {
    onSalaryChange(tempSalary);
  };
  
  // Reset to default value
  const handleReset = () => {
    setTempSalary(0); // Reset to default value
    onSalaryChange(0); // Also update parent
  };

  return (
    <div className={styles.dropdownMenu} style={{ padding: "1rem", width: "250px" }}>
      <input
        type="range"
        min="0"
        max={salaryKeys.length - 1}
        step="1"
        value={Math.max(0, salaryKeys.indexOf(tempSalary))}
        onChange={handleSalarySliderChange}
        className={styles.slider}
      />
      <div className={styles.salaryValue}>{salaryLevels[tempSalary]}</div>
      <div className={styles.buttonContainer}>
        <button className={styles.resetButton} onClick={handleReset}>초기화</button>
        <button className={styles.applyButton} onClick={handleApply}>적용</button>
      </div>
    </div>
  );
};

export default SalaryFilter;
