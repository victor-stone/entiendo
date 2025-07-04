import React from "react";

const TableCell = ({
  children,
  clamp = false,
  className = "",
  width,
  ...props
}) => {
  let style = {
    color: "var(--color-primary-600)",
    background: "none",
    ...props.style,
  };
  if (clamp) {
    style = {
      ...style,
      maxWidth: "350px",
      width: "350px",
    };
  }
  if (width) {
    style = {
      ...style,
      width: width,
      maxWidth: width,
    };
  }
  return (
    <td style={style} {...props}>
      {children}
    </td>
  );
};

export default TableCell;