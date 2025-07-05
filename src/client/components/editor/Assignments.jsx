import { useEffect } from 'react';
import Listing from '../../components/listing/Listing';
import { LoadingSpinner } from '../../components/ui';
import { useAssignmentReportsStore, useAssignIdiomStore, useUserStore } from '../../stores';

export default function Assignments({ 
    report, 
    tools,
    filters,
    columns,
    onSelectRow,
    ...props
})
{
    const { getToken } = useUserStore();
    const { fetch, loading, data, error, reset, reportName, setReportName, patchData } = useAssignmentReportsStore();
    const { error: assignError, assign } = useAssignIdiomStore();

    useEffect(() => {
        if (reportName !== report) {
            reset();
            setReportName(report);
        }
        if (!data && !loading && reportName) {
            fetch({ reportName, ...props }, getToken);
        }
    }, [data, getToken, fetch, loading, reportName, report, reset, setReportName]);

    if (error) { return <p className="text-red-500">{error}</p>; }
    if (assignError) { return <p className="text-red-500">{assignError}</p>; }
    if (loading || !data) { return <LoadingSpinner />; }

    async function commitAssign(id, value) {
        let record = await assign(id, value, getToken);
        patchData(record);
    }
    async function onUpdateRow( row, ctx ) {
      if( ctx.action == 'assignSource ') {
        await commitAssign(row.idiomId, ctx.value)
      }    
    }

    return (
        <Listing
            data={data}
            tools={tools}
            filters={filters}
            columns={columns}
            onUpdateRow={onUpdateRow}
            onSelectRow={onSelectRow}
        />
    );
}