import { useState } from 'react';
import Assignments from '../../components/editor/Assignments';
import { useUserStore } from '../../stores';
import { Card } from '../../components/layout';
import { AssignmentForm } from '../../components/editor/AssignmentForm';
import { useAssignmentReportsStore } from '../../stores';
const report = 'ASSIGNED_IDIOMS';

const features = {
    tone: false,
    usage: false,
    source: false,
    assign: false,
    sync: true,
    audio: true,
    transcription: true,
    search: false
  }

export function Editor() {
    const [showModal, setShowModal] = useState(false);
    const [selectedIdiom, setSelectedIdiom] = useState('');
    const { patchData } = useAssignmentReportsStore();

    function handleCloseModal(result) {
        if( result ){
            patchData(result);
        }
        setShowModal(false);
    }

    function onSelectRow(_,idiom) {
        setSelectedIdiom(idiom);
        setShowModal(true);
    }

    const { profile, getToken } = useUserStore();
    const _props = { editor: profile.editor };
    return (
        <Card title={`Assigned Idioms @ ${profile.editor}`}>
            <Assignments reportName={report} reportProps={_props} features={features} onSelectItem={onSelectRow} />
            <AssignmentForm idiom={selectedIdiom} show={showModal} onClose={handleCloseModal} />
        </Card>
    )
}