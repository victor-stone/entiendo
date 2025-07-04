import React from "react";

function EditorPicker({ voice, onChange, voices }) {
  const ecss = "border rounded px-2 py-1 dark:text-primary-900";

  return (
    <label>
      <span className="font-bold">Editor</span>{" "}
      <select
        value={voice}
        onChange={(e) => onChange(e.target.value)}
        className={ecss}
      >
        <option value="-all">all</option>
        <option value="-pending">all pending</option>
        {voices.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
}

export default EditorPicker;