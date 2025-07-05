import React from "react";

const headerCSS =
  "px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider";
const headerSortCSS =
  "cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700";

export const SortableHeaderCell = ({
  label,
  sortKey,
  handleSort,
  indicator
}) => (
  <th onClick={() => handleSort(sortKey)} className={`${headerCSS} ${headerSortCSS}`}>
    {label} {indicator}
  </th>
);

export const EmptyHeader = ({ text }) => <th className={headerCSS}>{text}</th>;

// New ListingHeader for meta-driven columns
const ListingHeader = ({ columns, handleSort, listingSort }) => {
  const indicator = (key) => {
    if (!listingSort || !listingSort.key || listingSort.key !== key)
      return null;
    return listingSort.direction === "ascending" ? " ↑" : " ↓";
  };

  return (
    <thead className="bg-primary-50 dark:bg-primary-800">
      <tr>
        {columns.map((col, idx) =>
          col.sortable ? (
            <SortableHeaderCell
              key={col.name || idx}
              handleSort={handleSort}
              label={col.label}
              sortKey={col.key}
              indicator={indicator(col.key)}
            />
          ) : (
            <EmptyHeader key={col.name || idx} text={col.label} />
          )
        )}
      </tr>
    </thead>
  );
};

export default ListingHeader;
