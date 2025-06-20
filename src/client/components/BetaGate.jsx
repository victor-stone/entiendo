import { useEffect, useState } from 'react';
import { useBetaSettingStore } from '../stores/settingsStore';
import debug from 'debug';

const debugBeta = debug('app:beta')

export default function BetaGate({ children }) {
  const {
    inBeta,
    verifiedBeta,
    loading,
    error,
    getSettings,
    verifyBetaPassword,
  } = useBetaSettingStore();
  debugBeta('render BetaGate')
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    getSettings();
  }, [getSettings]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  debugBeta('inBeta: %o   verifiedBeta: %o', inBeta, verifiedBeta);

  if (inBeta && !verifiedBeta) {
    return (
      <div style={{ maxWidth: 400, margin: '100px auto', textAlign: 'center' }}>
        <h2>Beta Access</h2>
        <form
          onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            setLocalError(null);
            const ok = await verifyBetaPassword(password);
            setSubmitting(false);
            if (!ok) setLocalError('Incorrect password');
          }}
        >
          <input
            name="betapassword  "
            type="password"
            placeholder="Enter beta password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={submitting}
            autoComplete="beta-password"
            className="rounded border-2 p-2 mb-3 border-primary-200"
            style={{ width: '100%' }}
          />
          <br />
          <button type="submit" className="btn btn-primary" disabled={submitting || !password} >
            {submitting ? 'Verifying...' : 'Enter'}
          </button>
        </form>
        {localError && <div style={{ color: 'red', marginTop: 8 }}>{localError}</div>}
      </div>
    );
  }

  return children;
}