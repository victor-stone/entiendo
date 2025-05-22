import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import IdiomList    from '../../components/admin/IdiomList';
import ImportManager from '../../components/admin/ImportManager';

function IdiomListPage() {
  const location = useLocation();
  const [idioms, setIdioms] = useState([]);

  useEffect(() => {
    // Get idioms from location state if available
    if (location.state && location.state.idioms) {
      setIdioms(location.state.idioms);
    }
  }, [location.state]);

  return (
    <ImportManager
      title="Idiom List"
      subtitle="Manage and view idioms"
      idioms={idioms}
      setIdioms={setIdioms}
    >
      {idioms.length > 0 ? (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary-800 dark:text-primary-200">
              Idioms ({idioms.length})
            </h2>
          </div>
          <IdiomList idioms={idioms} />
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-primary-600 dark:text-primary-300 mb-4">
            No idioms available to display
          </p>
          <Link 
            to="/admin/upload" 
            className="px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Go to Upload Page
          </Link>
        </div>
      )}
    </ImportManager>
  );
}

export default IdiomListPage; 