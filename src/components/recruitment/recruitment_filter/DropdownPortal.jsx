import React from "react";
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';

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

DropdownPortal.propTypes = {
  children: PropTypes.node.isRequired,
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired
  }).isRequired
};

export default DropdownPortal;
