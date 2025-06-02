import React, { useState } from 'react';
import {useAdminStore, useUserStore} from '../stores';
import { Card, CardField } from '../components/layout';

const BugReport = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [problemType, setProblemType] = useState('');
  const problemOptions = [
    "Can't log in",
    "Audio doesn't match example transcript",
    "App is slow or unresponsive",
    "Progress not saving",
    "Bug in exercise feedback",
    "UI layout is broken",
    "Audio is distored/too loud/too soft",
    "Audio does not play",
    "Translation is incorrect",
    "Other (describe below)"
  ];
  const { reportBug, loading, error, bugreport } = useAdminStore();
  const getToken = useUserStore(state => state.getToken);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      return;
    }
    const token = await getToken();
    const fullBody = problemType ? `[${problemType}]\n${body}` : body;
    await reportBug(title, fullBody, [], token);
    setSubmitted(true);
  };

  if (submitted && bugreport) {
    return (
      <Card title="Bug Report Submitted">
        <Card.Body>
          <div>Thank you for your report!</div>
          <pre>{JSON.stringify(bugreport, null, 2)}</pre>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card title={<span>Report a Bug</span>}>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          <CardField title='Problem Type'>
            <select
              value={problemType}
              onChange={e => setProblemType(e.target.value)}
              required
              className='border rounded px-2 py-1 w-full'
            >
              <option value="" disabled>Select a problem...</option>
              {problemOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </CardField>
          <CardField title='Title'>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className='border rounded px-2 py-1 w-full'
            />
          </CardField>
          <CardField title='Description' hint={`Do not put your email address or any private information here`}>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={6}
              required
              className='border rounded px-2 py-1 w-full'
            />
          </CardField>
          <CardField isFull={false}>
            {error && <div>{error}</div>}
            <button type="submit" disabled={loading || !title.trim() || !body.trim()} className='btn btn-primary'>
              {loading ? 'Submitting...' : 'Submit Bug Report'}
            </button>
          </CardField>
        </form>
      </Card.Body>
    </Card>
  );
};

export default BugReport;
