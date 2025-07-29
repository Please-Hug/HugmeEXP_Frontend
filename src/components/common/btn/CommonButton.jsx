import React, { useState } from 'react';
import styles from './CommonButton.module.scss';

function CommonButton({ 
  onClick, 
  children, 
  className, 
  backgroundColor,
  color,
  borderRadius,
  padding,
  border,
  hoverBackgroundColor,
  hoverColor,
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    backgroundColor,
    color,
    borderRadius,
    padding,
    border,
  };

  // hover props가 제공되었을 때만 hover 스타일을 만듭니다.
  const hoverStyle = {
    backgroundColor: hoverBackgroundColor,
    color: hoverColor,
  };

  // isHovered 상태에 따라 적용할 최종 스타일을 결정합니다.
  // hover props가 없는 경우, SCSS 파일의 :hover 스타일이 적용됩니다.
  const currentStyle = isHovered
    ? { ...baseStyle, ...hoverStyle }
    : baseStyle;

  return (
    <button
      className={`${styles.commonButton} ${className || ''}`}
      style={currentStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default CommonButton;
