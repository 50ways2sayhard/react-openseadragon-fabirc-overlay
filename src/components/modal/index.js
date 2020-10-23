import PropTypes from "prop-types";
import React from "react";

export default function Modal({ show, children, position }) {
  const pos = position ? position : ["50%", "50%"];
  return (
    <div
      style={{
        display: show ? "block" : "none",
        position: "absolute",
        left: pos[0],
        top: pos[1],
      }}
    >
      {children}
    </div>
  );
}

Modal.propTypes = {
  show: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};

Modal.defaultProps = {
  show: true,
};
