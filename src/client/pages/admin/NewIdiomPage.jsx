import { useNavigate } from 'react-router-dom';
import NewIdiomForm from '../../components/admin/NewIdiomForm';

const NewIdiomPage = () => {
  const navigate = useNavigate();

  const handleSaveSuccess = (response) => {
    if (window.confirm('Idiom saved. Add an example?')) {
      navigate(`/admin/example/${response.idiomId}`);
    }
  };

  return (<NewIdiomForm onSaveSuccess={handleSaveSuccess} />);
  
};

export default NewIdiomPage; 