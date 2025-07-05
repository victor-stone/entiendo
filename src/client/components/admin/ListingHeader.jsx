

const headerCSS =
  "px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider";
const headerSortCSS =
  "cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700";

// Table header cell component
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

// ListingHeader component for table header
const ListingHeader = ({ handleSort, columns, listingSort }) => {

  const indicator = (key) => {
    if (!listingSort || !listingSort.key || listingSort.key !== key)
      return null;
    return listingSort.direction === "ascending" ? " ↑" : " ↓";
  }

  return <thead className="bg-primary-50 dark:bg-primary-800">
    <tr>
      {columns.sync && <EmptyHeader text="num" />}
      <SortableHeaderCell
        handleSort={handleSort}
        label="Idiom"
        sortKey="text"
        indicator={indicator("text")}
      />
      <SortableHeaderCell
        handleSort={handleSort}
        label="Translation"
        sortKey="translation"
        indicator={indicator("translation")}
      />
      {columns.tone && (
        <SortableHeaderCell
          handleSort={handleSort}
          label="Tone"
          sortKey="tone"
          indicator={indicator("tone")}          
        />
      )}
      {columns.usage && (
        <SortableHeaderCell
          handleSort={handleSort}
          label="Usage"
          sortKey="usage"
          indicator={indicator("usage")}
        />
      )}
      {columns.transcription && <EmptyHeader text="audio transcription" />}
      {columns.source && <EmptyHeader />}
      {columns.assign && <EmptyHeader />}
    </tr>
  </thead>;
}

export default ListingHeader;