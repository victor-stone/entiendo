import React from 'react';

/**
 * HighlightedText component
 * Displays text with a specific snippet highlighted
 */
const HighlightedText = ({ text, highlightedSnippet, textClassName, highlightClassName }) => {
  if (!text || !highlightedSnippet) return text || null;
  
  return (
    <>
      {text.split(highlightedSnippet).map((part, index, array) => (
        <React.Fragment key={index}>
          {part}
          {index < array.length - 1 && (
            <span className={highlightClassName || "underline font-bold text-primary-600 dark:text-primary-400"}>
              {highlightedSnippet}
            </span>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default HighlightedText; 