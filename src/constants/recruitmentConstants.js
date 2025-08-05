// Icon imports - no React import needed for just the definitions
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
import { SiSpring, SiMysql, SiKotlin, SiPostgresql, SiRedis, SiFastapi } from "react-icons/si";

// Icon and color definitions
export const iconDefinitions = {
  "Python": { component: FaPython, color: "#4B8BBE" },
  "Spring": { component: SiSpring, color: "#6DB33F" },
  "AWS": { component: FaAws, color: "#FF9900" },
  "git": { component: FaGitAlt, color: "#F05032" },
  "iOS": { component: FaApple, color: "#A2AAAD" },
  "html": { component: FaHtml5, color: "#E34F26" },
  "javascript": { component: FaJs, color: "#F7DF1E" },
  "mysql": { component: SiMysql, color: "#4479A1" },
  "Linux": { component: FaLinux, color: "#000000" },
  "Android": { component: FaAndroid, color: "#3DDC84" },
  "Kotlin": { component: SiKotlin, color: "#7F52FF" },
  "PostgreSQL": { component: SiPostgresql, color: "#336791" },
  "Redis": { component: SiRedis, color: "#DC382D" },
  "FastAPI": { component: SiFastapi, color: "#009688" },
};

// Skills data without direct JSX
export const skillsData = Object.entries(iconDefinitions).map(([name, { component: Icon, color }]) => ({
  name,
  iconInfo: { component: Icon, color }
}));

// Job types
export const jobTypes = {
  all: "직무",
  frontend: "프론트엔드",
  backend: "백엔드",
  designer: "디자이너",
  mobile: "모바일",
};

// Regions
export const regions = {
  all: "지역",
  seoul: "서울",
  bundang: "분당",
};

// Education levels
export const educations = {
  0: "학력",
  10: "고졸",
  20: "초대졸",
  30: "대졸",
  40: "석사",
  50: "박사",
};

// Salary levels
export const salaryLevels = {
  0: "회사 내규에 따름",
  3000: "3000 ~ 4000",
  4000: "4000 ~ 5000",
  5000: "5000 ~ 6000",
  6000: "6000 이상",
};

// Helper function for salary keys
export const getSalaryKeys = () => Object.keys(salaryLevels)
  .map(Number)
  .sort((a, b) => a - b);
