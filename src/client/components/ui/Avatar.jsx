import React from 'react';

/**
 * Avatar component for displaying user profile images
 * Falls back to initials if no image is available
 */
const Avatar = ({ user, size = 'md', className = '' }) => {
  // Get user's initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  // Render avatar based on whether user has a picture
  if (user?.picture) {
    return (
      <img 
        src={user.picture}
        alt={user.name || 'User avatar'} 
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  // Fallback to initials
  return (
    <div 
      className={`${sizeClasses[size]} ${className} rounded-full bg-primary-600 text-white flex items-center justify-center font-medium`}
    >
      {getInitials(user?.name)}
    </div>
  );
};

export default Avatar; 