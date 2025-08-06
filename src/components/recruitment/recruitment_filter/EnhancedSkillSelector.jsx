import React, { useState, useContext, useEffect } from "react";
import styles from "./RecruitmentFilter.module.scss";
import { iconDefinitions } from "../../../constants/recruitmentConstants";
import { FilterDataContext } from "../../../pages/recruitment/RecruitmentMap";

const EnhancedSkillSelector = ({ selectedSkills, onSkillChange, closeDropdown }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelectedSkills, setTempSelectedSkills] = useState(selectedSkills);
  const { filterData, loading } = useContext(FilterDataContext);
  
  // Update local state when parent props change
  useEffect(() => {
    setTempSelectedSkills(selectedSkills);
  }, [selectedSkills]);
  
  // 검색어로 기술 스택 필터링
  const filteredTechStacks = loading ? [] : filterData.techStacks.filter(stack => 
    stack.labelKo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stack.labelEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 아이콘 정보 가져오기
  const getIconInfo = (stack) => {
    // 대소문자 구분 없이 아이콘 찾기
    const iconKey = Object.keys(iconDefinitions).find(
      key => key.toLowerCase() === stack.labelEn.toLowerCase() || key.toLowerCase() === stack.labelKo.toLowerCase()
    );
    
    return iconKey ? iconDefinitions[iconKey] : null;
  };
  
  // Handle local skill selection
  const handleSkillToggle = (skillId) => {
    setTempSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId) 
        : [...prev, skillId]
    );
  };
  
  // Apply changes to parent component
  const handleApply = () => {
    // We need to update each skill individually to match the parent component's logic
    const skillsToAdd = tempSelectedSkills.filter(id => !selectedSkills.includes(id));
    const skillsToRemove = selectedSkills.filter(id => !tempSelectedSkills.includes(id));
    
    // First remove skills that are no longer selected
    skillsToRemove.forEach(id => onSkillChange(id));
    
    // Then add newly selected skills
    skillsToAdd.forEach(id => onSkillChange(id));
    
    // Close dropdown after applying changes
    closeDropdown();
  };
  
  // Reset to default value
  const handleReset = () => {
    setTempSelectedSkills([]); // Reset to empty array
    
    // Clear all selected skills in parent
    if (selectedSkills.length > 0) {
      selectedSkills.forEach(id => onSkillChange(id));
    }
  };

  return (
    <div
      className={styles.dropdownMenu}
      style={{
        width: "400px",
        padding: "1rem",
      }}
    >
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="기술 스택 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      
      <div className={styles.skillsContainer}>
        {filteredTechStacks.map((stack) => {
          const iconInfo = getIconInfo(stack);
          
          return (
            <div key={stack.id} className={styles.skillTag}>
              <input
                type="checkbox"
                id={`skill-${stack.id}`}
                checked={tempSelectedSkills.includes(stack.id)}
                onChange={() => handleSkillToggle(stack.id)}
              />
              <label htmlFor={`skill-${stack.id}`}>
                {iconInfo && React.createElement(iconInfo.component, { color: iconInfo.color })}
                {stack.labelKo}
              </label>
            </div>
          );
        })}
      </div>
      
      <div className={styles.buttonContainer} style={{ marginTop: "1rem" }}>
        <button className={styles.resetButton} onClick={handleReset}>초기화</button>
        <button className={styles.applyButton} onClick={handleApply}>적용</button>
      </div>
    </div>
  );
};

export default EnhancedSkillSelector;
