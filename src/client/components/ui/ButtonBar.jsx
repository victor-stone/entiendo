// ButtonBar.jsx
// Simple button bar for aligning children to the right

const ButtonBar = ({ children }) => (
  <div className="flex justify-end mt-4">{children}</div>
);

export default ButtonBar;
