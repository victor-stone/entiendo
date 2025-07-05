import { useState } from "react";
import { Card } from "../layout/Card";
import sortItems from "../../../shared/lib/sortItems";
import { ListingColumns } from "./ListingColumns";
import { ListingFilters } from "./ListingFilters";
import ListingHeader from "./ListingHeader";
import ListingBody from "./ListingBody";
import { ListingTools } from "./ListingTools";

const Listing = ({
  data,
  filters = ["text", "tone", "usage"],
  columns = ["text", "translation", "tone", "usage"],
  tools = [],
  context = { voices: ["pato", "karina", "lucia", "victor"] },
  onUpdateRow,
  onSelectRow,
}) => {
  const [listingSort, setListingSort] = useState({
    key: "",
    direction: "ascending",
  });

  // Build filters from ListingFilters by name
  const _filters = filters
    .map((name) => ListingFilters.find((f) => f.name === name))
    .filter(Boolean);

  // Local state for each filter
  const _filterObject = Object.fromEntries(
    _filters.map((f) => [f.name, f.defaultValue])
  );
  const [filterStates, setFilterStates] = useState(_filterObject);

  // Compose filter UIs
  const filterUIs = _filters.map((f) => (
    <div key={f.name} className="mb-2 md:mb-0 w-full md:w-1/4">
      {f.render(
        filterStates[f.name],
        (value) => setFilterStates((s) => ({ ...s, [f.name]: value })),
        context
      )}
    </div>
  ));

  // Apply filters
  let filteredItems = _filters.reduce(
    (items, f) => items.filter((row) => f.filter(row, filterStates[f.name])),
    data
  );

  // Apply sorting
  const _columns = columns
    .map((name) => ListingColumns.find((col) => col.name === name))
    .filter(Boolean);
  if (listingSort.key) {
    const col = _columns.find((c) => c.key === listingSort.key);
    if (col && typeof col.sorter === "function") {
      filteredItems = col.sorter(
        filteredItems,
        listingSort.direction === "ascending" ? 1 : -1
      );
    } else {
      filteredItems = sortItems(
        filteredItems,
        listingSort.key,
        listingSort.direction
      );
    }
  }

  // Build tools from ListingTools by name
  const _tools = tools
    .map((name) => ListingTools.find((t) => t.name === name))
    .filter(Boolean);
  // Compose tool UIs (pass filteredItems as rows)
  const toolUIs = _tools.map((t) => (
    <div key={t.name} className="mb-2 md:mb-0 w-full md:w-1/4">
      {t.render({ rows: filteredItems })}
    </div>
  ));

  // Handle sorting when column header is clicked
  const handleSort = (key) => {
    setListingSort((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  return (
    <Card>
      <Card.Section>
        <div className="flex flex-col md:flex-row md:items-end md:space-x-4">
          {filterUIs}
          {toolUIs}
        </div>
      </Card.Section>
      <Card.Section style={{ maxHeight: 500, overflowY: "scroll" }}>
        <table className="min-w-full divide-y divide-primary-200 dark:divide-primary-700">
          <ListingHeader
            columns={_columns}
            handleSort={handleSort}
            listingSort={listingSort}
          />
          <ListingBody
            columns={_columns}
            filteredItems={filteredItems}
            onUpdateRow={onUpdateRow}
            context={context}
            onSelectRow={onSelectRow}
          />
        </table>
      </Card.Section>
      <Card.Section>
        <p>
          Showing {filteredItems.length} of {data.length} items
        </p>
      </Card.Section>
    </Card>
  );
};

export default Listing;
