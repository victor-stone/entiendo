import { Navigate } from 'react-router-dom';
import { useUserStore, useGetSettingsStore } from '../stores';
import { APP_CATCHPHRASE } from '../../shared/constants/appText.js'
import LoginButton from '../components/ui/LoginButton.jsx';
import BetaLogin from '../components/ui/BetaLogin.jsx';

const Landing = () => {

  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const {
    verifiedBeta,
    inBeta,
    verifyBetaPassword,
  } = useGetSettingsStore();

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="flex items-start justify-end h-1/2 w-1/2 ml-auto pt-12">
      <div className="w-full text-right">
        <h1 className="text-5xl">entiendo</h1>
        <p
          className="text-lg text-gray-900 dark:text-gray-300 max-w-2xl mb-3"
          style={{
            textTransform: 'lowercase',
            fontVariant: 'small-caps',
            fontSize: '80%'
          }}>{APP_CATCHPHRASE}</p>
        {!verifiedBeta && inBeta ? (
          <BetaLogin verifyBetaPassword={verifyBetaPassword} />
        ) : (
          <div><LoginButton /></div>
        )}
      </div>
    </div>
  );
};

export default Landing;