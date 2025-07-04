import { useEffect } from 'react';
import Listing from '../../components/admin/Listing';
import { LoadingSpinner } from '../../components/ui';
import { useAssignmentReportsStore, useAssignIdiomStore, useUserStore } from '../../stores';

export default function Assignments({ 
    reportName: reportNameProp, 
    reportProps = {},
    features,
    onSelectItem
})
{
    const { getToken } = useUserStore();
    const { fetch, loading, data, error, reset, reportName, setReportName, patchData } = useAssignmentReportsStore();
    const { error: assignError, assign } = useAssignIdiomStore();

    useEffect(() => {
        if (reportName !== reportNameProp) {
            reset();
            setReportName(reportNameProp);
        }
        if (!data && !loading && reportName) {
            fetch({ reportName, ...reportProps }, getToken);
        }
    }, [data, getToken, fetch, loading, reportName, reportNameProp, reset, setReportName]);

    if (error) { return <p className="text-red-500">{error}</p>; }
    if (assignError) { return <p className="text-red-500">{assignError}</p>; }
    if (loading || !data) { return <LoadingSpinner />; }

    async function commitAssign(id, value) {
        let record = await assign(id, value, getToken);
        patchData(record);
    }

    return (
        <Listing
            data={data}
            getToken
            features={features}
            onAssign={commitAssign}
            onSelectItem={onSelectItem}
        />
    );
}