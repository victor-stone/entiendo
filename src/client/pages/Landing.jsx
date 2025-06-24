import { Navigate } from 'react-router-dom';
import { useUserStore } from '../stores';
import { APP_CATCHPHRASE } from '../../shared/constants/appText.js'
import LoginButton from '../components/ui/LoginButton.jsx';

const Landing = () => {

  const isAuthenticated = useUserStore(state => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="flex items-start justify-end h-1/2 w-1/2 ml-auto mr-2 pt-12">
      <div className="w-full text-right">
        <h1 className="text-5xl">entiendo</h1>
        <p
          className="text-lg text-gray-900 dark:text-gray-300 max-w-2xl mb-3"
          style={{
            textTransform: 'lowercase',
            fontVariant: 'small-caps',
            fontSize: '80%'
          }}>{APP_CATCHPHRASE}</p>

          <div><LoginButton /></div>
      </div>
    </div>
  );
};

export default Landing;