import { LoadingIndicator } from '../../components/ui';
import { useResetCachesStore, useUserStore } from '../../stores';
import { useEffect } from 'react';

export default function PromptsPage() {
    const { getToken } = useUserStore();
    const { action, loading, error, data } = useResetCachesStore();

    useEffect(() => {
        if( !data && !loading ) {
            action(getToken);
        }
    }, [data, loading, action, getToken])

    if( error ) {
        return <p className="color-red">{error}</p>;
    }

    if( loading || !data ) {
        return <LoadingIndicator />
    }

    return <div><pre>Data has been reset: ${JSON.stringify(data,null,2)}</pre> </div>

}