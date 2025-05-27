import React, { useState } from 'react';
import { useUserStore, useAdminStore } from '../../stores';
import { AlertMessage } from '../ui';


/**
 * Manages the importing and processing of idioms
 * @param {Object} props
 * @param {Array} props.idioms - List of idioms to manage
 * @param {Function} props.setIdioms - Function to update idioms
 * @param {Function} [props.onReset] - Optional function to reset the form
 * @param {React.ReactNode} props.children - Child components
 */
function ImportManager({ 
  idioms, 
  setIdioms, 
  onReset,
  children 
}) {
  // Get authentication and admin functions from stores
  const { getToken }                    = useUserStore();
  const { importIdioms }                = useAdminStore();
  const [savingStatus, setSavingStatus] = useState({ status: 'idle', message: '' });

  const handleSaveIdioms = async () => {
    if (idioms.length === 0) {
      return;
    }

    setSavingStatus({ status: 'saving', message: 'Saving idioms to the database...' });

    try {
      const token = await getToken();
      const result = await importIdioms(idioms, token);
      
      if (result && result.idioms && result.idioms.length > 0) {
        setSavingStatus({ 
          status: 'success', 
          message: `Successfully saved ${result.idioms.length} / errors: ${result.errors.length} / duplicates: ${result.duplicates.length}.` 
        });
        
        // Clear the idioms after successful save
        if (result.errors && result.errors.length === 0) {
          setIdioms([]);
          if (onReset) onReset();
        } else if (result.errors) {
          // Keep only the failed items in the list
          setIdioms(result.errors);
        }
      } else {
        setSavingStatus({ 
          status: 'error', 
          message: result && result.errors ? 
            `Failed to save idioms. ${result.errors.length} errors.` : 
            'Failed to save idioms to the database.'
        });
      }
    } catch (error) {
      console.error('Error saving idioms:', error);
      setSavingStatus({ 
        status: 'error', 
        message: error.message || 'Failed to save idioms to the database.' 
      });
    }
  };

  return (
      <>
        {/* Child components */}
        {children}

        {/* Status messages */}
        {savingStatus.status === 'success' && (
          <AlertMessage 
            message={savingStatus.message} 
            type="success" 
          />
        )}

        {savingStatus.status === 'error' && (
          <AlertMessage 
            message={savingStatus.message} 
            type="error" 
          />
        )}

        {/* Actions for idioms */}
        {idioms.length > 0 && (
          <div className="mt-8">
            <div className="flex space-x-3">
              <button 
                onClick={handleSaveIdioms}
                disabled={savingStatus.status === 'saving'}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  savingStatus.status === 'saving'
                    ? 'bg-primary-400 cursor-not-allowed dark:bg-primary-700'
                    : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
                }`}
              >
                {savingStatus.status === 'saving' ? 'Saving...' : 'Save to Database'}
              </button>
              {onReset && (
                <button
                  onClick={onReset}
                  className="px-4 py-2 rounded-md text-white bg-gray-500 hover:bg-gray-600 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Upload Another File
                </button>
              )}
            </div>
          </div>
        )}
    </>
  );
}

export default ImportManager; 