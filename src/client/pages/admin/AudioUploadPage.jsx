import { useParams } from 'react-router-dom';
import AudioUploader from '../../components/admin/AudioUploader';
import { Card } from '../../components/layout';
import { LoadingSpinner } from '../../components/ui';
import IdiomTable from '../../components/admin/IdiomTable'; // <-- Import IdiomTable
import React, { useEffect, useState } from 'react';

import { useAudioReportsStore, useAssignIdiomStore, useUserStore } from '../../stores';

function Assignment({idiom, voices, onSelect, getToken}) {
    function onChange(value) {
        onSelect(idiom.idiomId, value, getToken);
        // 😬
        idiom.assigned = { source: value }
    }
    return <span><select value={idiom.assigned?.source || ''} onChange={e => onChange(e.target.value)}>
        <option></option>
        {voices.map( (voice,i) => <option key={i}>{voice}</option>) }
        </select></span>
}

function AssignmentId({idiom}) {
    return <span>{idiom.idiomId.slice(-4)}</span>
}

function IdiomsPending() { return <IdiomsAudioReport reportName="IDIOMS_PENDING" />}
function IdiomsNoAudio() { return <IdiomsAudioReport reportName="IDIOMS_NO_EXAMPLES" />}

function IdiomsAudioReport({reportName: reportNameProp}) {
    const { getToken } = useUserStore();
    const { fetch, loading, data, error, reset, reportName, setReportName } = useAudioReportsStore();
    const { error: assignError, assign } = useAssignIdiomStore();

    useEffect(() => {
        if( reportName !== reportNameProp ) {
            reset();
            setReportName(reportNameProp);
        }
        if (!data && !loading && reportName) {
            fetch({ reportName }, getToken);
        }
    }, [data, getToken, fetch, loading, reportName]);

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }
    if (assignError) {
        return <p className="text-red-500">{assignError}</p>;
    }

    if (loading || !data) {
        return <LoadingSpinner />;
    }

    const columns = [
    {   columnName: 'Ass.', 
        component: Assignment, 
        props: { 
            voices: [ 'pato', 'lucia', 'karina' ],
            onSelect: assign,
            getToken
        } 
    },
    {   columnName: '#', 
        component: AssignmentId, 
        props: { 
        } 
    },
    ];

    return <IdiomTable idioms={data} extraColumns={columns}/>;
}

function TabButtons({ activeTab, setActiveTab, tabs }) {
    return (
        <div className="flex border-b mb-4">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    className={`px-4 py-2 focus:outline-none ${activeTab === tab.key ? 'border-b-2 border-blue-500 font-bold' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

export default function AudioUploadPage() {
    const { exampleId } = useParams();
    const [activeTab, setActiveTab] = useState('upload');

    const tabs = [
        { key: 'upload', label: 'Audio Uploader' },
        { key: 'idioms', label: 'Unassigned' },
        { key: 'pending', label: 'Pending' }
    ];

    return (
        <Card title="Upload Audio">
            <TabButtons activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
            <Card.Body>
              {activeTab === 'upload' ? (
                <AudioUploader exampleId={exampleId} />
              ) : activeTab === 'pending' ? (
                <IdiomsPending />
              ) : (
                <IdiomsNoAudio />
              )}
            </Card.Body>
        </Card>
    );
}