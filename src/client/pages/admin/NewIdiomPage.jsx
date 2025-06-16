import { useNavigate } from 'react-router-dom';
import IdiomForm from '../../components/admin/IdiomForm';

const NewIdiomPage = () => {
  const navigate = useNavigate();

  const handleSaveSuccess = (response) => {
    if (window.confirm('Idiom saved. Add an example?')) {
      navigate(`/admin/example/${response.idiomId}`);
    }
  };

  return (<IdiomForm onSaveSuccess={handleSaveSuccess} />);
  
};

export default NewIdiomPage; 