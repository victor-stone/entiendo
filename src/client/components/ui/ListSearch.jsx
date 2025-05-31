import React from "react";

/**
 * ListSearch - A generic search input component for lists/tables.
 * @param {string} searchTerm - The current search term value.
 * @param {function} setSearchTerm - Function to update the search term.
 * @param {string} [className] - Optional additional class names for the container.
 * @param {string} [placeholder] - Optional placeholder for the input.
 * @param {string} [label] - Optional label for the input (defaults to "Search").
 */
const ListSearch = ({ searchTerm, setSearchTerm, className, placeholder, label }) => (
  <div className={className || "md:w-1/3"}>
    <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
      {label || "Search"}
    </label>
    <input
      type="text"
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      placeholder={placeholder || "Search..."}
      className="w-full px-3 py-2 border border-primary-300 dark:border-primary-700 rounded-md 
        text-primary-900 dark:text-primary-100 bg-white dark:bg-primary-800
        focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
  </div>
);

export default ListSearch;
