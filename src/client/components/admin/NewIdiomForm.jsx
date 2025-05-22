import { useState } from 'react';
import adminService from '../../services/adminService';
import { useUserStore } from '../../stores';
import ToneSelector from '../exercise/ToneSelector';
import { Card, CardBody, CardField, CardHeader } from '../layout';

const NewIdiomForm = ({ onSaveSuccess, onError }) => {
  // Get authentication token from user store
  const getToken = useUserStore(state => state.getToken);

  // Form state
  const [text, setIdiomText]          = useState('');
  const [translation, setTranslation] = useState('');
  const [tone, setTone]               = useState('');
  const [usage, setUsage]             = useState('0');
  const [loading, setLoading]         = useState(false);

  // Create a new idiom
  const handleSaveIdiom = async () => {
    setLoading(true);

    try {
      if (!text || !translation) {
        throw new Error('Idiom text and translation are required');
      }

      const idiomData = {
        text,
        translation,
        tone,
        usage
      };

      // Get auth token and pass it to the service call
      const token = await getToken();
      const response = await adminService.createIdiom(idiomData, token);

      if (response && response.idiomId) {
        if (onSaveSuccess) {
          onSaveSuccess(response);
        }
        resetForm();
        return response;
      } else {
        throw new Error('Failed to create idiom');
      }
    } catch (err) {
      if (onError) {
        onError(err.message || 'An error occurred during submission');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setIdiomText('');
    setTranslation('');
    setTone('');
    setUsage('0');
  };

  return (
    <Card>
      <CardHeader>Create New Idiom</CardHeader>
      <CardBody>
        <CardField>
          <label className="block text-sm font-medium">
            Idiom Text *
            <input
              type="text"
              value={text}
              onChange={(e) => setIdiomText(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </label>
        </CardField>

        <CardField>
          <label className="block text-sm font-medium">
            Translation *
            <input
              type="text"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </label>
        </CardField>

        <CardField>
          <ToneSelector
            value={tone}
            onChange={setTone}
            required={true}
            allowSystem={true}
          />
        </CardField>
        <CardField>
          <label className="block text-sm font-medium">
            Usage

            <select
              value={usage}
              onChange={e => setUsage(e.target.value)}
              className="mt-1 block border border-gray-300 rounded-md shadow-sm p-2"
              disabled={loading}
            >
              <option value="0">System</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
              <option>10</option>
            </select>
          </label>
        </CardField>
        <CardField>
          <button
            type="button"
            onClick={handleSaveIdiom}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-4"
          >
            {loading ? 'Saving...' : 'Save Idiom'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded"
          >
            Reset
          </button>
        </CardField>
      </CardBody>
    </Card>
  );
};

export default NewIdiomForm; 