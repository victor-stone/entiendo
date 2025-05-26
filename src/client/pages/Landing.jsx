import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore, useSettingsStore } from '../stores';
import { APP_CATCHPHRASE } from '../../shared/constants/appText.js'
import LoginButton from '../components/ui/LoginButton.jsx';
import logo from '../assets/images/subtle_flickering_outline_lightbulb.gif';

const Landing = () => {
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const {
    verifiedBeta,
    needBetaTest,
    verifyBetaPassword,
    checkForBetaTest
  } = useSettingsStore();
  const [betaPassword, setBetaPassword] = useState('');
  const [betaError, setBetaError] = useState('');

  useEffect(() => {
    checkForBetaTest();
  }, [checkForBetaTest]);

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleBetaSubmit = async (e) => {
    e.preventDefault();
    setBetaError('');
    const ok = await verifyBetaPassword(betaPassword);
    if (!ok) setBetaError('Incorrect password. Please try again.');
    setBetaPassword('');
  };

  return (
    <div className="flex flex-col items-center justify-center text-center" >
      <div className="relative flex items-center justify-center w-full max-w-xs mx-auto" style={{ backgroundColor: "#f4f2ec", borderRadius: "18px" }}>
        <img src={logo} alt="Entiendo Logo" className="w-full h-auto object-contain" style={{ opacity: 0.55 }}/>
        <h1 className="absolute -mt-8 text-4xl md:text-5xl font-bold pointer-events-none"
          style={{ textShadow: '0 0 10px #275185a8', color: '#00000094' }}>entiendo</h1>
      </div>
      <p
        className="text-lg text-gray-900 dark:text-gray-300 max-w-2xl mb-3"
        style={{
          textTransform: 'lowercase',
          fontVariant: 'small-caps',
          fontSize: '80%'
        }}
      >
        {APP_CATCHPHRASE}
      </p>
      {!verifiedBeta && needBetaTest ? (
        <form onSubmit={handleBetaSubmit} className="mb-4 flex flex-col items-center">
          <div className="flex flex-row items-center gap-2">
            <input
              type="password"
              placeholder="Enter beta password"
              value={betaPassword}
              onChange={e => setBetaPassword(e.target.value)}
              className="border rounded px-3 py-2"
              autoFocus
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go
            </button>
          </div>
          {betaError && <div className="text-red-600 mt-2">{betaError}</div>}
        </form>
      ) : (
        <div><LoginButton /></div>
      )}
    </div>
  );
};

export default Landing;