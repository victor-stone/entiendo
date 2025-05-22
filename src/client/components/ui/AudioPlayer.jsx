import React from 'react';

/**
 * AudioPlayer component
 * Displays an audio player with controls
 */
const AudioPlayer = ({ url }) => {
  if (!url) return null;
  
  return (
    <div className="text-gray-700 dark:text-gray-300 mb-4">
      <audio 
        src={url} 
        controls 
        controlsList="nodownload"
        className="w-full"
      />
    </div>
  );
};

export default AudioPlayer; 