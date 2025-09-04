import { useEffect, useState } from "react";
import { useUserStore, useReportsStore } from "../stores";
import ReportsView from "../components/ReportsView.jsx";

function Reports() {
  const { getToken } = useUserStore();
  const { data, fetch, generate, error, loading } = useReportsStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!data && !loading && !error) {
      fetch(getToken);
    }
  }, [data, getToken, fetch, error, loading]);

  useEffect(() => {
    if (data && Array.isArray(data.reports)) {
      if (selectedIndex >= data.reports.length) {
        setSelectedIndex(0);
      }
    }
  }, [data]);

  function onGenerate() {
    generate(getToken);
  }

  return (
    <ReportsView
      data={data}
      loading={loading}
      error={error}
      onGenerate={onGenerate}
      selectedIndex={selectedIndex}
      onSelectReport={setSelectedIndex}
    />
  );
}

export default Reports;
