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

  // hover props가 제공되었을 때만 hover 스타일을 적용합니다.
  const currentStyle = isHovered && (hoverBackgroundColor || hoverColor)
    ? {
        ...baseStyle,
        ...(hoverBackgroundColor && { backgroundColor: hoverBackgroundColor }),
        ...(hoverColor && { color: hoverColor }),
      }
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
