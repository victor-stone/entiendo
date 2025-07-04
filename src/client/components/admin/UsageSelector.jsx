import React from 'react';

const UsageSelector = ({ value, onChange }) => (
  <label className="block text-sm font-medium">
    Usage
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="mt-1 block border border-gray-300 dark:text-primary-900 rounded-md shadow-sm p-2"
    >
      <option value="all">All</option>
      {[...Array(10)].map((_, i) => (
        <option key={i + 1} value={String(i + 1)}>
          {i + 1}
        </option>
      ))}
    </select>
  </label>
);

export default UsageSelector;