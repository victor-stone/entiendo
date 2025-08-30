function EditorPicker({ voices, voice, onChange , expanded = true, ecss = "border rounded px-2 py-1 dark:text-primary-900" }) {

  return (
    <label>
      {expanded && <span className="font-bold">Editor </span>}
      <select
        value={voice}
        onChange={(e) => onChange(e.target.value)}
        className={ecss}
      >
        {expanded && <option value="-all">all</option> } 
        {expanded && <option value="-pending">all pending</option> }
        {!expanded && <option value=""> </option> }
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