import React from 'react';
import { usePutPromptsStore, usePromptsStore } from '../../stores';
import ServerObjectForm from '../../components/ServerObjectForm';

export default function PromptsPage()  {
    return (
        <ServerObjectForm 
            title="AI Prompts"
            numCols={1}
            useFetchStore={usePromptsStore} 
            usePutStore={usePutPromptsStore} 
        />
    );
}

