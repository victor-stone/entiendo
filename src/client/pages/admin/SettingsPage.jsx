import { usePutSettingsStore, useSimpleSettingsStore } from '../../stores';
import ServerObjectForm from '../../components/ServerObjectForm';

export default function SettingsPage()  {
    return (
        <ServerObjectForm 
            title="Application Settings"
            numCols={1}
            useFetchStore={useSimpleSettingsStore} 
            usePutStore={usePutSettingsStore}
        />
    );
}
