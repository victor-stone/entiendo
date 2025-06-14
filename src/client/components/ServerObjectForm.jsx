import React, { useEffect, useState } from 'react';
import { LoadingIndicator } from './ui';
import { Card } from './layout';
import { useUserStore } from '../stores';


export function ServerObjectForm({ title, numCols = 1, useFetchStore, usePutStore, onSaved }) {
    
    const { getToken }                               = useUserStore();
    const { fetch, loading, error, data, reset }     = useFetchStore();
    const { put, loading: saving, error: saveError } = usePutStore();
    const [form, setForm]                            = useState({});

    useEffect(() => {
        if (!data && !loading && getToken) {
            fetch(getToken);
        }
    }, [fetch, data, loading, getToken]);

    useEffect(() => {
        if (data) setForm(data);
    }, [data]);

    if (error) return <p className="text-red-500">{error.msg || error.toString()}</p>;
    if (loading || !data) return <LoadingIndicator />;

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();        
        const result = await put(form, getToken);
        reset();
        onSaved && onSaved();
        return result;
    };

    return (
        <Card title={title}>
            <Card.Body>
                <form onSubmit={handleSubmit}>
                    <Card.Grid columns={numCols}>
                        {Object.entries(form).sort().map(([key, value]) => (
                            <React.Fragment key={key}>
                                <Card.GridLabel title={key} right={numCols == 2} />
                                <Card.GridField>
                                    {typeof value === 'string' && (value.length > 60 || value.includes('\n')) ? (
                                        <textarea
                                            className="border rounded px-2 py-1 w-full"
                                            value={value ?? ''}
                                            onChange={e => handleChange(key, e.target.value)}
                                            rows={Math.min(8, Math.max(2, (value.match(/\n/g)?.length || 0) + 2))}
                                        />
                                    ) : (
                                        <input
                                            className="border rounded px-2 py-1 w-full"
                                            type="text"
                                            value={value ?? ''}
                                            onChange={e => handleChange(key, e.target.value)}
                                        />
                                    )}
                                </Card.GridField>
                            </React.Fragment>
                        ))}
                    </Card.Grid>
                    <Card.Field>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        {saveError && <span className="text-red-500 ml-4">{saveError.msg || saveError.toString()}</span>}
                    </Card.Field>
                </form>
            </Card.Body>
        </Card>
    );
}

export default ServerObjectForm;