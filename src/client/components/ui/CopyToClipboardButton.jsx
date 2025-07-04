import { useState } from 'react';
import { Glyph } from './';

const CopyToClipboardButton = ({ value, getValue = null, className = '', title = 'Copy', icon = 'ClipboardIcon', successIcon = 'CheckIcon' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const data = getValue ? getValue() : value;
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      className={`ml-2 px-2 py-1 text-xs rounded hover:bg-gray-300 ${className}`}
      title={title}
      onClick={handleCopy}
      type="button"
    >
      {copied && (
        <span className="ml-1 text-green-600">
          <Glyph name={successIcon} />
        </span>
      )}
      {title} <Glyph name={icon} />
    </button>
  );
};

export default CopyToClipboardButton;