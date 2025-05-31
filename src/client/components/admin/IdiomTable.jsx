import { useState, useEffect } from 'react';
import ListSearch from '../ui/ListSearch';

// IdiomTableHeader component for table header
const IdiomTableHeader = ({ handleSort, renderSortIndicator }) => (
  <thead className="bg-primary-50 dark:bg-primary-800">
    <tr>
      <th 
        onClick={() => handleSort('text')}
        className="px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700"
      >
        Idiom {renderSortIndicator('text')}
      </th>
      <th 
        onClick={() => handleSort('translation')}
        className="px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700"
      >
        Translation {renderSortIndicator('translation')}
      </th>
      <th 
        onClick={() => handleSort('tone')}
        className="px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700"
      >
        Tone {renderSortIndicator('tone')}
      </th>
      <th 
        onClick={() => handleSort('usage')}
        className="px-6 py-3 text-left text-xs font-medium text-primary-700 dark:text-primary-300 uppercase tracking-wider cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700"
      >
        Usage {renderSortIndicator('usage')}
      </th>
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

const IdiomTable = ({ idioms, onSave }) => {
  const [filteredIdioms,   setFilteredIdioms]   = useState([]);
  const [selectedTone, setSelectedTone] = useState('all');
  const [searchTerm,       setSearchTerm]       = useState('');
  const [sortConfig,       setSortConfig]       = useState({ key: 'text', direction: 'ascending' });
  
  // Initialize filtered idioms with all idioms
  useEffect(() => {
    setFilteredIdioms(idioms);
  }, [idioms]);
  
  // Handle filtering and sorting when filter criteria change
  useEffect(() => {
    let result = idioms;
    if (selectedTone !== 'all') result = result.filter(i => i.tone === selectedTone);
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter(i => i.text?.toLowerCase().includes(t) || i.translation?.toLowerCase().includes(t));
    }
    if (sortConfig.key) result = sortIdioms(result, sortConfig.key, sortConfig.direction);
    setFilteredIdioms(result);
  }, [idioms, selectedTone, searchTerm, sortConfig]);
  
  // Handle sorting when column header is clicked
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };
  
  // Get all unique tones from idioms
  const tones = ['all', ...new Set(idioms.map(idiom => idiom.tone))];
  
  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  return (
    <div className="bg-white dark:bg-primary-900 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-primary-200 dark:border-primary-700 flex flex-col md:flex-row gap-4">
        <ListSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search idioms..." />
        <IdiomTableToneSelect selectedTone={selectedTone} setSelectedTone={setSelectedTone} tones={tones} />
        {onSave && (
          <div className="md:w-1/3 flex items-end">
            <button
              onClick={() => onSave(idioms)}
              className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 
                text-white rounded-md transition-colors"
            >
              Save All Idioms
            </button>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-primary-200 dark:divide-primary-700">
          <IdiomTableHeader handleSort={handleSort} renderSortIndicator={renderSortIndicator} />
          <tbody className="bg-white dark:bg-primary-900 divide-y divide-primary-200 dark:divide-primary-700">
            {filteredIdioms.length > 0 ? (
              filteredIdioms.map((idiom, index) => (
                <tr 
                  key={idiom.idiomId || index}
                  className="hover:bg-primary-50 dark:hover:bg-primary-800"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-primary-100">
                    {idiom.text}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-300">
                    {idiom.translation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-300">
                    {idiom.tone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-300">
                    {idiom.usage || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-primary-500 dark:text-primary-400">
                  No idioms found matching the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-primary-50 dark:bg-primary-800 border-t border-primary-200 dark:border-primary-700">
        <p className="text-sm text-primary-600 dark:text-primary-300">
          Showing {filteredIdioms.length} of {idioms.length} idioms
        </p>
      </div>
    </div>
  );
};

export default IdiomTable;