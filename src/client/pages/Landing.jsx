import { Navigate } from 'react-router-dom';
import { useUserStore } from '../stores';
import { APP_CATCHPHRASE } from '../../shared/constants/appText.js'
import LoginButton from '../components/ui/LoginButton.jsx';
import logo from '../assets/images/entiendoLogo.png';

const Landing = () => {
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }
  
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center w-full max-w-xs mx-auto">
        <img src={logo} alt="Entiendo Logo" className="w-full h-auto object-contain" />
        <h1 className="absolute -mt-8 text-4xl md:text-5xl font-bold pointer-events-none"
          style={{ textShadow: '0 0 10px #275185a8', color: '#00000094' }}>entiendo</h1>
      </div>
      <p className="text-lg text-gray-900 dark:text-gray-300 max-w-2xl mb-3">
        {APP_CATCHPHRASE}
      </p>
      <div><LoginButton /></div>
    </div>
  );
};

export default Landing;