import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {useAdminStore, useUserStore} from '../stores';
import { Card, CardField } from '../components/layout';

const BugReport = ({ exampleID }) => {
  const { exampleID: exampleIDParam } = useParams();
  const [searchParams]                = useSearchParams();
  const exampleIDQuery                = searchParams.get('exampleID');
  const effectiveExampleID            = exampleID ?? exampleIDParam ?? exampleIDQuery ?? null;
  const [title, setTitle]             = useState('');
  const [body, setBody]               = useState('');
  const [submitted, setSubmitted]     = useState(false);
  const [problemType, setProblemType] = useState('');

  const problemOptions = [
    "Can't log in",
    "App is slow or unresponsive",
    "Page layout is broken",
    "--",
    "Mistake in exercise feedback",
    "Translation is incorrect",
    "Transcription is incorrect",
    "--",    
    "Audio doesn't match example transcript",
    "Audio is distored/too loud/too soft",
    "Audio does not play",
    "--",
    "Other (describe below)"
  ];
  
  const { reportBug, loading, error, bugreport } = useAdminStore();
  const getToken = useUserStore(state => state.getToken);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      return;
    }

    const token       = await getToken();
    const exampleLine = effectiveExampleID ? `\n\nexampleID: ${effectiveExampleID}` : '';
    const fullBody    = (problemType ? `[${problemType}]\n${body}` : body) + exampleLine;
    const labels      = effectiveExampleID ? ["has-example", `example:${effectiveExampleID}`] : [];

    await reportBug(title, fullBody, labels, token);
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
          {effectiveExampleID && (
            <CardField title='Example ID'>
              <input
                type="text"
                value={String(effectiveExampleID)}
                readOnly
                className='border rounded px-2 py-1 w-full bg-gray-100 dark:text-primary-900'
              />
            </CardField>
          )}
          <CardField title='Problem Type'>
            <select
              value={problemType}
              onChange={e => setProblemType(e.target.value)}
              required
              className='border rounded px-2 py-1 w-full dark:text-primary-900'
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
              className='border rounded px-2 py-1 w-full dark:text-primary-900'
            />
          </CardField>
          <CardField title='Description' hint={`Do not put your email address or any private information here`}>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={6}
              required
              className='border rounded px-2 py-1 w-full dark:text-primary-900'
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
