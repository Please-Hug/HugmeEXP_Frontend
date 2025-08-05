import React from "react";
import styles from "./RecruitmentFilter.module.scss";
import { skillsData } from "../../../constants/recruitmentConstants";

const SkillSelector = ({ selectedSkills, onSkillChange }) => {
  return (
    <div
      className={styles.dropdownMenu}
      style={{
        width: "400px",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        padding: "1rem",
      }}
    >
      {skillsData.map((skill) => {
        const Icon = skill.iconInfo.component;
        return (
          <div key={skill.name} className={styles.skillTag}>
            <input
              type="checkbox"
              id={`skill-${skill.name}`}
              checked={selectedSkills.includes(skill.name)}
              onChange={() => onSkillChange(skill.name)}
            />
            <label htmlFor={`skill-${skill.name}`}>
              <Icon color={skill.iconInfo.color} />
              {skill.name}
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default SkillSelector;
