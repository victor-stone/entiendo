import React, { useEffect, useState } from 'react';
import idiomService from '../../services/idiomService';

const ToneSelector = ({ value, onChange, required = false, allowSystem = false }) => {
  const [tones, setTones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTones = async () => {
      try {
        setLoading(true);
        const response = await idiomService.getTones();
        if (response && response.tones) {
          setTones(response.tones);
        }
      } catch (err) {
        setError('Failed to load tones');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTones();
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium">
        Context {required && '*'}
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="mt-1 block border border-gray-300 rounded-md shadow-sm p-2"
          required={required}
          disabled={loading}
        >
          {!required && <option value="">All</option>}
          {allowSystem && <option value="[]">System decides</option>}
          {tones.map((tone) => (
            <option key={tone} value={tone}>
              {tone}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default ToneSelector;