import React from 'react';

const AlertMessage = ({ message, type = 'success' }) => {
  const styles = {
    success: 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
    error: 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
    info: 'bg-primary-50 border border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300',
    warning: 'bg-accent-50 border border-accent-200 text-accent-700 dark:bg-accent-900/20 dark:border-accent-800 dark:text-accent-300'
  };

  if (!message) return null;

  return (
    <div className={`${styles[type]} px-4 py-3 rounded-lg shadow-sm my-2 flex items-start`}>
      <span className="flex-grow">{message}</span>
    </div>
  );
};

export default AlertMessage; 