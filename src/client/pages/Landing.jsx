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
            fontSize: '90%'
          }}>{APP_CATCHPHRASE}</p>

          <div><LoginButton /></div>
          <div><p className="mt-10 italic">
            DIG: this software is under development and not as stable as is will most assuredly  be, you know, later. 
             Please don't be discouraged if something breaks. Gracias por tu paciencia. 
            </p></div>
      </div>
    </div>
  );
};

export default Landing;