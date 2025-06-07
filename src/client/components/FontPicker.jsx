import { useState, useEffect } from 'react';
import { setFontClass, FontPicks } from '../lib/fontLoader';

const fontOptions = Object.values(FontPicks);

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
        className="border rounded px-2 py-1"
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
