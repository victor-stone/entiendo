import React, { useState } from 'react';
import useAdminStore from '../stores/adminStore';

const BugReport = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { reportBug, loading, error, bugreport } = useAdminStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await reportBug(title, body, []);
    setSubmitted(true);
  };

  if (submitted && bugreport) {
    return <div className="p-4 text-green-700">Thank you for your report!</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Report a Bug</h2>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Title</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Description</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={6}
          required
        />
      </div>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Bug Report'}
      </button>
    </form>
  );
};

export default BugReport;
