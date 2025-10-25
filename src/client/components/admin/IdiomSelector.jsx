import { useEffect, useState, useRef } from 'react';
import { useIdiomQuery } from '../../stores';
import { LoadingSpinner } from '../ui';

const IdiomSelector = ({ value, onChange, required = false }) => {
  const [inputValue,     setInputValue]     = useState('');
  const [filteredIdioms, setFilteredIdioms] = useState([]);
  const [isOpen,         setIsOpen]         = useState(false);

  const { query, loading, error, fetch } = useIdiomQuery();

  const wrapperRef = useRef(null);

  useEffect(() => {
    if( !query && !loading ) {
      fetch();
    }
  }, [query, loading, fetch]);

  useEffect(() => {
    if( query ) {
      // Set the input value based on the selected idiom
      const selectedIdiom = value && query.find(value);
      setInputValue(selectedIdiom ? selectedIdiom.text : '');
    }
  }, [value, query]);

  useEffect(() => {
    // Filter idioms based on input
    if (inputValue.trim() === '') {
      setFilteredIdioms([]);
    } else {
      const filtered = query.containsText(inputValue);
      setFilteredIdioms(filtered);
    }
  }, [inputValue, query]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if( error ) {
    return <p className="text-red-500">{error}</p>;
  }
  if( loading || !query ) {
    return <LoadingSpinner />
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleSelectIdiom = (idiom) => {
    setInputValue(idiom.text);
    onChange({ target: { value: idiom.idiomId } });
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium">
        Select Idiom {required && '*'}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="mt-1 block w-full dark:text-primary-900 border border-gray-300 rounded-md shadow-sm p-2"
          required={required}
          disabled={loading}
          placeholder="Type to search idioms"
        />
      </label>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 dark:text-primary-900 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredIdioms.length > 0 ? (
            filteredIdioms.map((idiom) => (
              <div
                key={idiom.idiomId}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectIdiom(idiom)}
              >
                {idiom.text}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No matching idioms found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default IdiomSelector; 