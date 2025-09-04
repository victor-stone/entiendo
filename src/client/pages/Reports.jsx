import { useEffect } from "react";
import { useUserStore, useReportsStore } from "../stores";
import ReportsView from "../components/ReportsView.jsx";

function Reports() {
  const { getToken } = useUserStore();
  const { data, fetch, generate, error, loading } = useReportsStore();

  useEffect(() => {
    if (!data && !loading && !error) {
      fetch(getToken);
    }
  }, [data, getToken, fetch, error, loading]);

  function onGenerate() {
    generate(getToken);
  }

  return (
    <ReportsView
      data={data}
      loading={loading}
      error={error}
      onGenerate={onGenerate}
    />
  );
}

export default Reports;
