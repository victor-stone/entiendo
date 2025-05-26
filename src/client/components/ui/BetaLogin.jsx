import { useState } from 'react';

const BetaLogin = ({ verifyBetaPassword }) => {
  const [betaPassword, setBetaPassword] = useState('');
  const [betaError, setBetaError] = useState('');

  const handleBetaSubmit = async (e) => {
    e.preventDefault();
    setBetaError('');
    const ok = await verifyBetaPassword(betaPassword);
    if (!ok) setBetaError('Incorrect password. Please try again.');
    setBetaPassword('');
  };

  return (
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
  );
};

export default BetaLogin;
