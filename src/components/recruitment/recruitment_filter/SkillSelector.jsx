import React, { useState, useContext } from "react";
import styles from "./RecruitmentFilter.module.scss";
import { iconDefinitions } from "../../../constants/recruitmentConstants";
import { FilterDataContext } from "../../../pages/recruitment/RecruitmentMap";
// 정적 데이터 대신 Context에서 기술 스택 데이터를 가져옵니다

const SkillSelector = ({ selectedSkills, onSkillChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { filterData, loading } = useContext(FilterDataContext);
  
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
                checked={selectedSkills.includes(stack.id)}
                onChange={() => onSkillChange(stack.id)}
              />
              <label htmlFor={`skill-${stack.id}`}>
                {iconInfo && React.createElement(iconInfo.component, { color: iconInfo.color })}
                {stack.labelKo}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillSelector;
