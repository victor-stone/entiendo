const Grid = ({ children, columns, className = null }) => {
  // Tailwind needs this to generate 
  // runtime css classes (default 1 col) -- how did this ever work?
  const colClass = {
    1: "grid-cols-1 md:grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-4",
  }[columns] || "grid-cols-1 md:grid-cols-1";

  return (
    <div className={`grid ${colClass} gap-4 mb-4 ${className}`}>
      {children}
    </div>
  );
};

export default Grid;