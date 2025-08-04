import React from "react";
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
import styles from "./RecruitmentFilter.module.scss";

// Skills data with icons
const skillsData = [
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
      {skillsData.map((skill) => (
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
  );
};

export default SkillSelector;
