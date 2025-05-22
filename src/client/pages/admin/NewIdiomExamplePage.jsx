import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NewExampleForm from '../../components/admin/NewExampleForm';

const NewIdiomExamplePage = () => {
  const { idiomId = '' } = useParams();
  const navigate = useNavigate();

  const handleSaveSuccess = (response) => {
    const { exampleId } = response;
    if (window.confirm('Example saved. Upload audio?')) {
      navigate(`/admin/audio/${exampleId}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl mb-4">Add Example</h2>
      <NewExampleForm
        idiomId={idiomId}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
};

export default NewIdiomExamplePage; 