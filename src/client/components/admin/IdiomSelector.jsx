import React, { useEffect, useState, useRef } from 'react';
import idiomService from '../../services/idiomService';

const IdiomSelector = ({ value, onChange, required = false, onIdiomsLoaded = null }) => {
  const [idioms,         setIdioms]         = useState([]);
  const [inputValue,     setInputValue]     = useState('');
  const [filteredIdioms, setFilteredIdioms] = useState([]);
  const [isOpen,         setIsOpen]         = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');

  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchIdioms = async () => {
      try {
        setLoading(true);
        const response = await idiomService.getIdiomsList();
        if (response && response.idioms) {
          // Sort idioms alphabetically by text
          const sortedIdioms = [...response.idioms].sort((a, b) => 
            a.text.localeCompare(b.text)
          );
          setIdioms(sortedIdioms);
          if (onIdiomsLoaded) {
            onIdiomsLoaded(sortedIdioms);
          }
        }
      } catch (err) {
        setError('Failed to load idioms');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIdioms();
  }, [onIdiomsLoaded]);

  useEffect(() => {
    // Set the input value based on the selected idiom
    const selectedIdiom = idioms.find(idiom => idiom.idiomId === value);
    setInputValue(selectedIdiom ? selectedIdiom.text : '');
  }, [value, idioms]);

  useEffect(() => {
    // Filter idioms based on input
    if (inputValue.trim() === '') {
      setFilteredIdioms(idioms);
    } else {
      const filtered = idioms.filter(idiom => 
        idiom.text.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredIdioms(filtered);
    }
  }, [inputValue, idioms]);

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
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required={required}
          disabled={loading}
          placeholder="Type to search idioms"
        />
      </label>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
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
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default IdiomSelector; 