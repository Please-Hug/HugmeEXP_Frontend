import React from "react";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import styles from "./RecruitmentFilter.module.scss";

// Define experience levels array
const experienceLevels = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10];

const ExperienceRangeSlider = ({ experience, onExperienceChange }) => {
  // Find indices in experienceLevels array that match current experience values
  const minIndex = experienceLevels.findIndex(level => level === experience[0]);
  const maxIndex = experienceLevels.findIndex(level => level === experience[1]);
  
  // Validate experience values
  if (minIndex === -1 || maxIndex === -1) {
    console.error('Invalid experience values provided:', experience);
    return null; // Return null to prevent rendering with invalid values
  }
  
  // Function to get the label for an experience level
  const getExperienceLabel = (level) => {
    if (level === -1) return "경력무관";
    if (level === 0) return "신입";
    return `${level}년`;
  };
  return (
    <div className={styles.filterGroup}>
      <h4>경력</h4>
      <div className={styles.rangeContainer}>
        <div className={styles.rangeSliderWrapper}>
          {/* Background rail */}
          <div className={styles.sliderRail}></div>
          
          {/* Active track between handles */}
          <div 
            className={styles.sliderTrack} 
            style={{
              left: `${(minIndex / (experienceLevels.length - 1)) * 100}%`,
              width: `${((maxIndex - minIndex) / (experienceLevels.length - 1)) * 100}%`
            }}
          ></div>
          
          {/* Min handle slider */}
          <div className={styles.sliderHandleContainer} style={{ zIndex: 1 }}>
            <Slider
              min={0}
              max={experienceLevels.length - 1}
              value={minIndex}
              onChange={(index) => {
                if (index <= maxIndex) {
                  onExperienceChange([experienceLevels[index], experience[1]]);
                }
              }}
              trackStyle={{ backgroundColor: 'transparent' }}
              railStyle={{ backgroundColor: 'transparent' }}
              handleStyle={{ borderColor: '#007bff', backgroundColor: '#007bff' }}
            />
          </div>
          
          {/* Max handle slider */}
          <div className={styles.sliderHandleContainer}>
            <Slider
              min={0}
              max={experienceLevels.length - 1}
              value={maxIndex}
              onChange={(index) => {
                if (index >= minIndex) {
                  onExperienceChange([experience[0], experienceLevels[index]]);
                }
              }}
              trackStyle={{ backgroundColor: 'transparent' }}
              railStyle={{ backgroundColor: 'transparent' }}
              handleStyle={{ borderColor: '#007bff', backgroundColor: '#007bff' }}
            />
          </div>
        </div>
        <div className={styles.experienceRangeLabels}>
          <span>{getExperienceLabel(experience[0])}</span>
          <span>{getExperienceLabel(experience[1])}</span>
        </div>
        <div className={styles.experienceLabel}>
          <span>
            {experience[0] === experience[1]
              ? getExperienceLabel(experience[0])
              : `${getExperienceLabel(experience[0])} ~ ${getExperienceLabel(experience[1])}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExperienceRangeSlider;
