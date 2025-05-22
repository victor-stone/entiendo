import React from 'react';
import { useParams } from 'react-router-dom';
import AudioUploader from '../../components/admin/AudioUploader';

export default function AudioUploadPage() {
    const { exampleId } = useParams();
    
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Upload Audio</h1>
            <AudioUploader 
                exampleId={exampleId} 
                onSuccess={() => console.log('Upload successful')}
                onError={(error) => console.error('Upload error:', error)}
            />
        </div>
    );
} 