import { useParams } from 'react-router-dom';
import AudioUploader from '../../components/admin/AudioUploader';
import { Card } from '../../components/layout';

export default function AudioUploadPage() {
    const { exampleId } = useParams();
    
    return (
        <Card title="Upload Audio">
            <Card.Body>
                <AudioUploader exampleId={exampleId} />
            </Card.Body>            
        </Card>
    );
} 