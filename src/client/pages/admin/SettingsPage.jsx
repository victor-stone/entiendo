import { usePutSettingsStore, useSimpleSettingsStore, useBetaSettingStore } from '../../stores';
import ServerObjectForm from '../../components/ServerObjectForm';

export default function SettingsPage()  {

    const { reset } = useBetaSettingStore();

    return (
        <ServerObjectForm 
            title="Application Settigns"
            numCols={2}
            useFetchStore={useSimpleSettingsStore} 
            usePutStore={usePutSettingsStore}
            onSave={reset}
        />
    );
}
