import { useParams } from 'react-router-dom';
import AudioManager from '../../components/admin/AudioManager';
import { Card } from '../../components/layout';
import { useState } from 'react';
import Assignments from '../../components/editor/Assignments';
import { TabButtons } from '../../components/ui';

const columns = {
    tone: true,
    usage: true,
    source: false,
    assign: true,
    sync: true,
    audio: false,
    search: true
  }

export default function AssignmentManagerPage() {
    const { exampleId } = useParams();
    const [activeTab, setActiveTab] = useState('assignments');

    const tabs = [
        { key: 'assignments', label: 'Assignable' },
        { key: 'upload', label: 'Audio Uploader' }
    ];

    return (
        <Card title="Manage Assignments">
            <TabButtons activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
            <Card.Body>
              {activeTab === 'upload' ? (
                <AudioManager exampleId={exampleId} />
              ) : (
                <Assignments reportName="ASSIGNABLE_IDIOMS" features={columns} />
              )}
            </Card.Body>
        </Card>
    );
}