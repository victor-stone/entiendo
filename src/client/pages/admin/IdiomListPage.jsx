import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import IdiomList from '../../components/admin/IdiomList';
import idiomService from '../../services/idiomService';

function IdiomListPage() {
  const [idioms, setIdioms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIdioms = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await idiomService.getIdiomsList();
        if (response && response.idioms) {
          setIdioms(response.idioms);
        } else {
          setError('Failed to load idioms.');
        }
      } catch (err) {
        setError('Failed to load idioms.');
      } finally {
        setLoading(false);
      }
    };
    fetchIdioms();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Idiom List</h1>
      <p className="text-primary-600 dark:text-primary-300 mb-2">Manage and view idioms</p>
      {loading ? (
        <div className="p-8 text-center">Loading idioms...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">{error}</div>
      ) : idioms.length > 0 ? (
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
            to="/admin/import" 
            className="px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Go to Import Page
          </Link>
        </div>
      )}
    </div>
  );
}

export default IdiomListPage;