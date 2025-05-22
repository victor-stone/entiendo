import React from 'react';

const OptionButton = ({ onClick, label }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-left hover:bg-gray-50"
    >
      {label}
    </button>
  );
};

export default OptionButton; 