import React from "react";

const headerCSS =
  "px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider";

// Table header cell component
export const SortableHeaderCell = ({
  label,
  sortKey,
  handleSort,
  renderSortIndicator,
}) => (
  <th
    onClick={() => handleSort(sortKey)}
    className={`${headerCSS} cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700`}
  >
    {label} {renderSortIndicator(sortKey)}
  </th>
);

export const EmptyHeader = ({ text }) => <th className={headerCSS}>{text}</th>;

// ListingHeader component for table header
const ListingHeader = ({ handleSort, renderSortIndicator, columns }) => (
  <thead className="bg-primary-50 dark:bg-primary-800">
    <tr>
      {columns.sync && <EmptyHeader text="num" />}
      <SortableHeaderCell
        handleSort={handleSort}
        renderSortIndicator={renderSortIndicator}
        label="Idiom"
        sortKey="text"
      />
      <SortableHeaderCell
        handleSort={handleSort}
        renderSortIndicator={renderSortIndicator}
        label="Translation"
        sortKey="translation"
      />
      {columns.tone && (
        <SortableHeaderCell
          handleSort={handleSort}
          renderSortIndicator={renderSortIndicator}
          label="Tone"
          sortKey="tone"
        />
      )}
      {columns.usage && (
        <SortableHeaderCell
          handleSort={handleSort}
          renderSortIndicator={renderSortIndicator}
          label="Usage"
          sortKey="usage"
        />
      )}
      {columns.transcription && <EmptyHeader text="audio transcription" />}
      {columns.source && <EmptyHeader />}
      {columns.assign && <EmptyHeader />}
      {columns.audio && <EmptyHeader />}
    </tr>
  </thead>
);

export default ListingHeader;