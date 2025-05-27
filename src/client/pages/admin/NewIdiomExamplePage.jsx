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

  return <NewExampleForm
        idiomId={idiomId}
        onSaveSuccess={handleSaveSuccess}
      />
};

export default NewIdiomExamplePage; 