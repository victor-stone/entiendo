import { useParams } from 'react-router-dom';
import AudioUploader from '../../components/admin/AudioUploader';
import { Card } from '../../components/layout';
import { LoadingSpinner } from '../../components/ui';
import IdiomTable from '../../components/admin/IdiomTable'; // <-- Import IdiomTable

import { useAudioReportsStore, useUserStore } from '../../stores';
import { useEffect, useState } from 'react';

function IdiomsNoAudio() {
    const { getToken } = useUserStore();
    const { fetch, loading, data, error } = useAudioReportsStore();

    useEffect(() => {
        if (!data && !loading) {
            fetch({ reportName: 'IDIOMS_NO_EXAMPLES' }, getToken);
        }
    }, [data, getToken, fetch, loading]);

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (loading || !data) {
        return <LoadingSpinner />;
    }

    return <IdiomTable idioms={data} />;
}

export default function AudioUploadPage() {
    const { exampleId } = useParams();
    const [activeTab, setActiveTab] = useState('upload');

    return (
        <Card title="Upload Audio">
            <div className="flex border-b mb-4">
                <button
                    className={`px-4 py-2 focus:outline-none ${activeTab === 'upload' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
                    onClick={() => setActiveTab('upload')}
                >
                    Audio Uploader
                </button>
                <button
                    className={`px-4 py-2 focus:outline-none ${activeTab === 'idioms' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
                    onClick={() => setActiveTab('idioms')}
                >
                    Idioms No Audio
                </button>
            </div>
            <Card.Body>
                {activeTab === 'upload' ? (
                    <AudioUploader exampleId={exampleId} />
                ) : (
                    <IdiomsNoAudio />
                )}
            </Card.Body>
        </Card>
    );
}