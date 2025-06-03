import { useState, useEffect } from 'react';
import { setFontClass } from '../lib/fontLoader';

const fontOptions = [
  { label: 'Nunito (Google)', value: 'nunito' },
  { label: 'Lato (Google)', value: 'lato' },
  { label: 'Avenir Next (Apple)', value: 'avenir' },
  { label: 'Noto Sans (Google)', value: 'noto' }
];

export default function FontPicker() {
  const [font, setFont] = useState(() => {
    return localStorage.getItem('fontPref') || 'noto';
  });

  useEffect(() => {
    setFontClass(font);
    localStorage.setItem('fontPref', font);
  }, [font]);

  return (
    <div>
      <label className="block mb-2 font-medium">Font</label>
      <select
        className="form-select"
        value={font}
        onChange={e => setFont(e.target.value)}
      >
        {fontOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
