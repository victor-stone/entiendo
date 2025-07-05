import { useEffect } from "react";
import Listing from "../../components/listing/Listing";
import { LoadingSpinner } from "../../components/ui";
import {
  useAssignmentReportsStore,
  useAssignIdiomStore,
  useUserStore,
  useAssignPublishStore,
} from "../../stores";

export default function Assignments({
  report,
  tools,
  filters,
  columns,
  onSelectRow,
  onUpdateRow,
  ...props
}) {
  const { getToken } = useUserStore();
  const {
    fetch,
    loading,
    data,
    error,
    reset,
    reportName,
    setReportName,
    patchData,
  } = useAssignmentReportsStore();
  const { error: assignError, assign } = useAssignIdiomStore();
  const { error: pubError, publish }   = useAssignPublishStore();

  useEffect(() => {
    if (reportName !== report) {
      reset();
      setReportName(report);
    }
    if (!data && !loading && reportName) {
      fetch({ reportName, ...props }, getToken);
    }
  }, [
    data,
    getToken,
    fetch,
    loading,
    reportName,
    report,
    reset,
    setReportName,
  ]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  
  if (assignError) {
    return <p className="text-red-500">{assignError}</p>;
  }

  if (loading || !data) {
    return <LoadingSpinner />;
  }

  async function _onUpdateRow(row, ctx) {
    if (onUpdateRow) {
      if (!onUpdateRow(row, ctx)) {
        return;
      }
    }

    let record;
    if (ctx.action == "assignSource") {
      record = await assign(row.idiomId, ctx.source, getToken);
    }
    if( ctx.action == 'publish' ) {
      record = await publish(row.idiomId, ctx.assigned, getToken )
    }
    if( record ) {
      patchData(record);
    }
      
  }

  return (
    <Listing
      data={data}
      tools={tools}
      filters={filters}
      columns={columns}
      onUpdateRow={_onUpdateRow}
      onSelectRow={onSelectRow}
    />
  );
}
