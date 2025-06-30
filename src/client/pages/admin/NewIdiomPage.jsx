import { useNavigate } from 'react-router-dom';
import IdiomForm from '../../components/admin/IdiomForm';
import { Card } from '../../components/layout';

const NewIdiomPage = () => {
  const navigate = useNavigate();

  const handleSaveSuccess = (response) => {
    if (window.confirm('Idiom saved. Add an example?')) {
      navigate(`/admin/example/${response.idiomId}`);
    }
  };

  return (<Card title="New Idiom"><Card.Body><IdiomForm onSaveSuccess={handleSaveSuccess} /></Card.Body></Card>);
  
};

export default NewIdiomPage; 