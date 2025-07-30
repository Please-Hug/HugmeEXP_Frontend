import React from "react";
import ReactDOM from "react-dom";

const DropdownPortal = ({ children, position }) => {
  const el = document.getElementById("dropdown-root");
  if (!el) return null;

  const style = {
    position: "absolute",
    top: `${position.top}px`,
    left: `${position.left}px`,
    zIndex: 1050, // Ensure it's above other elements
  };

  return ReactDOM.createPortal(<div style={style}>{children}</div>, el);
};

export default DropdownPortal;
