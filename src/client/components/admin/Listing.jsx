import { useState, useEffect } from "react";
import ListSearch from "../ui/ListSearch";
import { useListingStore } from "../../stores";
import { Card } from "../layout/Card";
import ToneSelector from "../ToneSelector"; // Adjust path if needed
import UsageSelector from "./UsageSelector";
import CSVtoClipboard from "./CSVtoClipboard";
import { AssignmentAudio } from "../editor/AssignmentForm";
import ListingHeader from "./ListingHeader";
import sortItems from "../../../shared/lib/sortItems";
import EditorPicker from "../editor/EditorPicker";
import { TableCell } from '../ui';
import {
  Assign,
  AssignmentSync,
  AssignmentSource,
  AssignTranscription,
} from "../editor/Assignments";


const Listing = ({
  data,
  onSelectItem,
  getToken,
  onAssign,
  features = {
    tone: true,
    usage: true,
    source: false,
    assign: false,
    sync: false,
    audio: false,
    transcription: false,
    search: true,
    filterVoice: false,
  },
}) => {
  const {
    listingSort,
    setListingSort,
    listingTextFilter,
    setListingTextFilter,
    listingTone,
    setListingTone,
    listingUsage,
    setListingUsage,
    listingVoice,
    setListingVoice,
  } = useListingStore();

  const [filteredItems, setFilteredItems] = useState([]);

  const voices = ["pato", "karina", "lucia", "victor"];

  // Filtering and sorting
  useEffect(() => {
    let result = data;

    if (listingTone !== "all")
      result = result.filter((i) => i.tone === listingTone);

    if (listingUsage !== "all")
      result = result.filter((i) => String(i.usage) === listingUsage);

    if (listingTextFilter) {
      const t = listingTextFilter.toLowerCase();
      result = result.filter(
        (i) =>
          i.text?.toLowerCase().includes(t) ||
          i.translation?.toLowerCase().includes(t)
      );
    }

    if (listingVoice) {
      if (listingVoice == "-all") {
        result = result;
      } else if (listingVoice == "-pending") {
        result = result.filter((i) => !!i.assigned?.source);
      } else {
        result = result.filter(
          (i) => !listingVoice || i.assigned?.source == listingVoice
        );
      }
    }

    if (listingSort.key) {
      result = sortItems(result, listingSort.key, listingSort.direction);
    }

    setFilteredItems(result);
  }, [
    listingSort,
    listingTextFilter,
    listingTone,
    listingUsage,
    listingVoice,
    data,
  ]);

  // Handle sorting when column header is clicked
  const handleSort = (key) => {
    setListingSort({
      key,
      direction:
        listingSort.key === key && listingSort.direction === "ascending"
          ? "descending"
          : "ascending",
    });
  };

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (!listingSort || !listingSort.key || listingSort.key !== key)
      return null;
    return listingSort.direction === "ascending" ? " ↑" : " ↓";
  };

  const thisColSpan = Object.keys(features).reduce(
    (sum, key) => (features[key] ? sum + 1 : sum),
    0
  );

  return (
    <Card>
      <Card.Section>
        <div className="flex flex-col md:flex-row md:items-end md:space-x-4">
          {features.search && (
            <ListSearch
              searchTerm={listingTextFilter}
              setSearchTerm={setListingTextFilter}
              placeholder="Search idioms..."
            />
          )}
          {features.tone && (
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <ToneSelector
                getToken={getToken}
                value={listingTone === "all" ? "" : listingTone}
                onChange={(val) => setListingTone(val === "" ? "all" : val)}
                required={false}
              />
            </div>
          )}
          {features.usage && (
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <UsageSelector value={listingUsage} onChange={setListingUsage} />
            </div>
          )}
          {(features.assign || features.filterVoice) && (
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <EditorPicker
                voices={voices}
                voice={listingVoice}
                onChange={setListingVoice}
              />
            </div>
          )}
          {features.assign && (
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <CSVtoClipboard filtered={filteredItems} />
            </div>
          )}
        </div>
      </Card.Section>
      <Card.Section style={{ maxHeight: 500, overflowY: "scroll" }}>
        <table className="min-w-full divide-y divide-primary-200 dark:divide-primary-700">
          <ListingHeader
            columns={features}
            handleSort={handleSort}
            renderSortIndicator={renderSortIndicator}
          />
          <tbody className="bg-white dark:bg-primary-900 divide-y divide-primary-200 dark:divide-primary-700">
            {filteredItems.length > 0 ? (
              filteredItems.map((r, index) => (
                <tr
                  key={r.exampleId || r.idiomId}
                  style={{ cursor: "pointer", background: "none" }}
                  onClick={() => onSelectItem && onSelectItem(r.idiomId, r)}
                >
                  {features.sync && (
                    <TableCell>
                      <AssignmentSync assigned={r.assigned} />
                    </TableCell>
                  )}
                  <TableCell clamp>{r.text}</TableCell>
                  <TableCell clamp>{r.translation}</TableCell>
                  {features.tone && <TableCell>{r.tone}</TableCell>}
                  {features.usage && <TableCell>{r.usage}</TableCell>}
                  {features.transcription && (
                    <TableCell width="60%">
                      <AssignmentAudio r={r} /> <AssignTranscription assigned={r.assigned} />
                    </TableCell>
                  )}
                  {features.assign && (
                    <TableCell>
                      <Assign obj={r} voices={voices} onAssign={onAssign} />
                    </TableCell>
                  )}
                  {(features.source || features.filterVoice) && (
                    <TableCell>
                      <AssignmentSource assigned={r.assigned} />
                    </TableCell>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <TableCell
                  colSpan={thisColSpan}
                  style={{
                    textAlign: "center",
                    color: "var(--color-primary-500)",
                    background: "none",
                  }}
                >
                  No items found matching the current filters
                </TableCell>
              </tr>
            )}
          </tbody>
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
