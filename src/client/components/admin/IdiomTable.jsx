import { useState, useEffect } from 'react';
import ListSearch from '../ui/ListSearch';
import { useIdiomTableStore } from '../../stores';
import { Card } from '../layout/Card';

// Table header cell component
const SortableHeaderCell = ({ label, sortKey, handleSort, renderSortIndicator }) => (
  <th
    onClick={() => handleSort(sortKey)}
    className="px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700"
  >
    {label} {renderSortIndicator(sortKey)}
  </th>
);

// IdiomTableHeader component for table header
const IdiomTableHeader = ({ handleSort, renderSortIndicator }) => (
  <thead className="bg-primary-50 dark:bg-primary-800">
    <tr>
      <SortableHeaderCell handleSort={handleSort} renderSortIndicator={renderSortIndicator} label="Idiom"       sortKey="text"        />
      <SortableHeaderCell handleSort={handleSort} renderSortIndicator={renderSortIndicator} label="Translation" sortKey="translation" />
      <SortableHeaderCell handleSort={handleSort} renderSortIndicator={renderSortIndicator} label="Tone"        sortKey="tone"        />
      <SortableHeaderCell handleSort={handleSort} renderSortIndicator={renderSortIndicator} label="Usage"       sortKey="usage"       />
    </tr>
  </thead>
);

// IdiomTableToneSelect component for tone selection
const IdiomTableToneSelect = ({ selectedTone, setSelectedTone, tones }) => (
  <div className="md:w-1/3">
    <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
      Tone
    </label>
    <select
      value={selectedTone}
      onChange={e => setSelectedTone(e.target.value)}
      className="w-full px-3 py-2 border border-primary-300 dark:border-primary-700 rounded-md 
        text-primary-900 dark:text-primary-100 bg-white dark:bg-primary-800
        focus:outline-none focus:ring-1 focus:ring-primary-500">
      {tones.map(tone => (
        <option key={tone} value={tone}>
          {tone === 'all' ? 'All Tones' : tone}
        </option>
      ))}
    </select>
  </div>
);

// Utility function to sort idioms
function sortIdioms(idioms, key, direction) {
  return [...idioms].sort((a, b) => {
    const aValue = a[key] || '';
    const bValue = b[key] || '';
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'ascending'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return direction === 'ascending'
        ? (aValue > bValue ? 1 : -1)
        : (bValue > aValue ? 1 : -1);
    }
  });
}

// Table cell component
const TableCell = ({ children, clamp = false, className = '', ...props }) => {
  let style = {
      color: 'var(--color-primary-600)',
      background: 'none',
      ...props.style
    };
  if( clamp ) {
    style = { ...style,
      maxWidth: '350px',
      width: '350px',
    };
  }
  return <td style={style} {...props}>{children}</td>
};

// Accept new props for state persistence
const IdiomTable = ({ idioms, onSelectIdiom }) => {
  // Use idiomStore for all UI state
  const {
    idiomTableSort, setIdiomTableSort,
    idiomTableFilter, setIdiomTableFilter,
    idiomTableScroll, setIdiomTableScroll,
    idiomTableTone, setIdiomTableTone
  } = useIdiomTableStore();

  const [filteredIdioms, setFilteredIdioms] = useState([]);

  // Filtering and sorting
  useEffect(() => {
    let result = idioms;
    if (idiomTableTone !== 'all') 
      result = result.filter(i => i.tone === idiomTableTone);
    if (idiomTableFilter) {
      const t = idiomTableFilter.toLowerCase();
      result = result.filter(i => i.text?.toLowerCase().includes(t) || i.translation?.toLowerCase().includes(t));
    }
    if (idiomTableSort.key) 
      result = sortIdioms(result, idiomTableSort.key, idiomTableSort.direction);
    setFilteredIdioms(result);
  }, [idioms, idiomTableTone, idiomTableFilter, idiomTableSort]);

  // Handle sorting when column header is clicked
  const handleSort = (key) => {
    setIdiomTableSort({
      key,
      direction:
        idiomTableSort.key === key && idiomTableSort.direction === 'ascending'
          ? 'descending'
          : 'ascending'
    });
  };

  // Get all unique tones from idioms
  const tones = ['all', ...new Set(idioms.map(idiom => idiom.tone))];

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (!idiomTableSort || !idiomTableSort.key || idiomTableSort.key !== key) return null;
    return idiomTableSort.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  // On scroll, update scroll position in store
  const handleScroll = (e) => {
    setIdiomTableScroll(e.target.scrollTop);
  };

  return (
    <Card>
      <Card.Section>
        <ListSearch searchTerm={idiomTableFilter} setSearchTerm={setIdiomTableFilter} placeholder="Search idioms..." />
        <IdiomTableToneSelect selectedTone={idiomTableTone} setSelectedTone={setIdiomTableTone} tones={tones} />
      </Card.Section>
      <Card.Section style={{ maxHeight: 500, overflowY: 'scroll' }}>
        <table className="min-w-full divide-y divide-primary-200 dark:divide-primary-700">
          <IdiomTableHeader handleSort={handleSort} renderSortIndicator={renderSortIndicator} />
          <tbody className="bg-white dark:bg-primary-900 divide-y divide-primary-200 dark:divide-primary-700">
            {filteredIdioms.length > 0 ? (
              filteredIdioms.map((idiom, index) => (
                <tr
                  key={idiom.idiomId || index}
                  style={{ cursor: 'pointer', background: 'none' }}
                  onClick={() => onSelectIdiom && onSelectIdiom(idiom.idiomId || idiom.id)}
                >
                  <TableCell clamp>{idiom.text}</TableCell>
                  <TableCell clamp>{idiom.translation}</TableCell>
                  <TableCell>{idiom.tone}</TableCell>
                  <TableCell>{idiom.usage}</TableCell>
                </tr>
              ))
            ) : (
              <tr>
                <TableCell colSpan={5} style={{ textAlign: 'center', color: 'var(--color-primary-500)', background: 'none' }}>
                  No idioms found matching the current filters
                </TableCell>
              </tr>
            )}
          </tbody>
        </table>
      </Card.Section>
      <Card.Section>
        <p>
          Showing {filteredIdioms.length} of {idioms.length} idioms
        </p>
      </Card.Section>
    </Card>
  );
};

export default IdiomTable;