import { useParams } from 'react-router-dom';
import AudioManager from '../../components/admin/AudioManager';
import { Card } from '../../components/layout';
import { LoadingSpinner } from '../../components/ui';
import IdiomTable from '../../components/admin/IdiomTable'; // <-- Import IdiomTable
import React, { useEffect, useState } from 'react';

import { useAudioReportsStore, useAssignIdiomStore, useUserStore } from '../../stores';

function Assignment({idiom, voices, onSelect}) {
    async function onChange(value) {
        onSelect(idiom.idiomId, value);
        // 😬
        // idiom.assigned = { source: value }
    }
    return <span><select value={idiom.assigned?.source || ''} onChange={e => onChange(e.target.value)}>
        <option></option>
        {voices.map( (voice,i) => <option key={i}>{voice}</option>) }
        </select></span>
}

function AssignmentSync({idiom}) {
    return <span>{idiom.assigned?.sync}</span>
}

// function IdiomsPending() { return <IdiomsAudioReport reportName="PENDING_IDIOMS" />}

function PendingFilter({idioms, filter}) {
    const [pending, setPending] = useState(false);

    const onCheck = () => {
        setPending(!pending);
        if( !pending ) { // we want the opposite of what it was
            const filtered = idioms.filter(idiom => {
                return idiom.assigned?.source;
            });
            filter(filtered);
        } else {
            filter(idioms);
        }
    }

    return (
        <label>
            Pending <input type="checkbox" checked={pending} onChange={onCheck} />
        </label>
    );
}

function AssignableIdioms() { return <IdiomsAudioReport reportName="ASSIGNABLE_IDIOMS" />}

function IdiomsAudioReport({reportName: reportNameProp, resetOnChange}) {
    const { getToken } = useUserStore();
    const { fetch, loading, data, error, reset, reportName, 
        setReportName, patchData } = useAudioReportsStore();
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

    if (error) { return <p className="text-red-500">{error}</p>; }
    if (assignError) { return <p className="text-red-500">{assignError}</p>; }
    if (loading || !data) { return <LoadingSpinner />; }

    async function assignIdiom(idiomId, value) { 
        const idiom = await assign(idiomId,value,getToken); 
        patchData(idiom);
    }

    const columns = [
    {   columnName: 'Ass.', 
        component: Assignment, 
        props: { 
            voices: [ 'pato', 'lucia', 'karina' ],
            onSelect: assignIdiom,
            getToken
        } 
    },
    {   columnName: '#', 
        component: AssignmentSync, 
        props: { 
        } 
    }
    ];

    const tools = [
        PendingFilter
    ];

    return <IdiomTable idioms={data} extraColumns={columns} extraTools={tools}/>;
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

export default function AudioManagerPage() {
    const { exampleId } = useParams();
    const [activeTab, setActiveTab] = useState('upload');

    const tabs = [
        { key: 'upload', label: 'Audio Uploader' },
        { key: 'idioms', label: 'Assignable' }
    ];

    return (
        <Card title="Upload Audio">
            <TabButtons activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
            <Card.Body>
              {activeTab === 'upload' ? (
                <AudioManager exampleId={exampleId} />
              ) : (
                <AssignableIdioms />
              )}
            </Card.Body>
        </Card>
    );
}