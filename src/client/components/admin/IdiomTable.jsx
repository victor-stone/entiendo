import { useState, useEffect } from 'react';
import ListSearch from '../ui/ListSearch';
import { useIdiomTableStore } from '../../stores';
import { Card } from '../layout/Card';
import ToneSelector from '../ToneSelector'; // Adjust path if needed

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
const IdiomTableHeader = ({ handleSort, renderSortIndicator, extraColumns = [] }) => (
  <thead className="bg-primary-50 dark:bg-primary-800">
    <tr>
      <SortableHeaderCell handleSort={handleSort} renderSortIndicator={renderSortIndicator} label="Idiom"       sortKey="text"        />
      <SortableHeaderCell handleSort={handleSort} renderSortIndicator={renderSortIndicator} label="Translation" sortKey="translation" />
      <SortableHeaderCell handleSort={handleSort} renderSortIndicator={renderSortIndicator} label="Tone"        sortKey="tone"        />
      <SortableHeaderCell handleSort={handleSort} renderSortIndicator={renderSortIndicator} label="Usage"       sortKey="usage"       />
      {extraColumns.map(col => (
        <th key={col.columnName} className="px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider">
          {col.columnName}
        </th>
      ))}
    </tr>
  </thead>
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
const IdiomTable = ({ idioms, onSelectIdiom, getToken, extraColumns = [], extraTools = [] }) => {
  // Use idiomStore for all UI state
  const {
    idiomTableSort, setIdiomTableSort,
    idiomTableFilter, setIdiomTableFilter,
    idiomTableScroll, setIdiomTableScroll,
    idiomTableTone, setIdiomTableTone
  } = useIdiomTableStore();

  const [filteredIdioms, setFilteredIdioms] = useState([]);
  const [usageFilter, setUsageFilter] = useState('all');

  // Filtering and sorting
  useEffect(() => {
    let result = idioms;
    if (idiomTableTone !== 'all') 
      result = result.filter(i => i.tone === idiomTableTone);
    if (usageFilter !== 'all') 
      result = result.filter(i => String(i.usage) === usageFilter);
    if (idiomTableFilter) {
      const t = idiomTableFilter.toLowerCase();
      result = result.filter(i => i.text?.toLowerCase().includes(t) || i.translation?.toLowerCase().includes(t));
    }
    if (idiomTableSort.key) 
      result = sortIdioms(result, idiomTableSort.key, idiomTableSort.direction);
    setFilteredIdioms(result);
  }, [idioms, idiomTableTone, idiomTableFilter, idiomTableSort, usageFilter]);

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
        <div className="flex flex-col md:flex-row md:items-end md:space-x-4">
            <ListSearch
              searchTerm={idiomTableFilter}
              setSearchTerm={setIdiomTableFilter}
              placeholder="Search idioms..."
            />
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <ToneSelector
              getToken={getToken}
              value={idiomTableTone === 'all' ? '' : idiomTableTone}
              onChange={val => setIdiomTableTone(val === '' ? 'all' : val)}
              required={false}
            />
          </div>
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            <label className="block text-sm font-medium">
              Usage
              <select
                value={usageFilter}
                onChange={e => setUsageFilter(e.target.value)}
                className="mt-1 block border border-gray-300 dark:text-primary-900 rounded-md shadow-sm p-2"
              >
                <option value="all">All</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={String(i+1)}>{i+1}</option>
                ))}
              </select>
            </label>
          </div>
          {/* Render extraTools here */}
          {extraTools.map((Tool, idx) =>
            <div key={idx} className="w-full md:w-auto mb-2 md:mb-0">
              <Tool filter={setFilteredIdioms} idioms={idioms} />
            </div>
          )}
        </div>
      </Card.Section>
      <Card.Section style={{ maxHeight: 500, overflowY: 'scroll' }}>
        <table className="min-w-full divide-y divide-primary-200 dark:divide-primary-700">
          <IdiomTableHeader handleSort={handleSort} renderSortIndicator={renderSortIndicator} extraColumns={extraColumns} />
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
                  {extraColumns.map((col, i) => (
                    <TableCell key={col.columnName + i}>
                      <col.component idiom={idiom} {...col.props} />
                    </TableCell>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <TableCell colSpan={5 + extraColumns.length} style={{ textAlign: 'center', color: 'var(--color-primary-500)', background: 'none' }}>
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