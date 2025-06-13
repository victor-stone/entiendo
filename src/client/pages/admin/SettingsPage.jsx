import React, { useEffect, useState } from 'react';
import { LoadingIndicator } from '../../components/ui';
import { usePutSettingsStore, useGetSettingsStore, useUserStore } from '../../stores';
import { Card } from '../../components/layout';


export default function SettingsPage()  {
    const { getToken } = useUserStore();
    const { getSettings, loading, error, settings, reset } = useGetSettingsStore();
    const { put, loading: saving, error: saveError } = usePutSettingsStore();
    const [form, setForm] = useState({});

    useEffect(() => {
        if (!settings && !loading) {
            getSettings();
        }
    }, [getSettings, settings, loading]);

    useEffect(() => {
        if (settings) setForm(settings);
    }, [settings]);

    if (error) return <p className="text-red-500">{error.msg || error.toString()}</p>;
    if (loading || !settings) return <LoadingIndicator />;

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = await getToken();
        const result = await put(form,token);
        reset();
        return result;
    };

    return (
        <Card title="Application Settings">
            <Card.Body>
                <form onSubmit={handleSubmit}>
                    <Card.Grid columns={2}>
                        {Object.entries(form).sort().map(([key, value]) => (
                            <React.Fragment key={key}>
                                <Card.GridLabel title={key} />
                                <Card.GridField>
                                    <input
                                        className="border rounded px-2 py-1 w-full"
                                        type="text"
                                        value={value ?? ''}
                                        onChange={e => handleChange(key, e.target.value)}
                                    />
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
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                        {saveError && <span className="text-red-500 ml-4">{saveError.msg || saveError.toString()}</span>}
                    </Card.Field>
                </form>
            </Card.Body>
        </Card>
    );
};
