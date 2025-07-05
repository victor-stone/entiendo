import { useState } from "react";
import Assignments from "../../components/editor/Assignments";
import { Card } from "../../components/layout";
import { AssignmentForm } from "../../components/editor/AssignmentForm";
import { useAssignmentReportsStore, useUserStore } from "../../stores";
const report = "ASSIGNED_IDIOMS";

export function Editor() {
  const [showModal, setShowModal] = useState(false);
  const [selectedIdiom, setSelectedIdiom] = useState("");
  const { patchData } = useAssignmentReportsStore();
  const {
    isAdmin,
    profile: { editor },
  } = useUserStore();

  function handleCloseModal(result) {
    if (result) {
      patchData(result);
    }
    setShowModal(false);
  }

  function onSelectRow(idiom) {
    setSelectedIdiom(idiom);
    setShowModal(true);
  }

  const columns = ["sync", "text", "translation", "transcription"];
  const tools = ["copyToClipboard"];
  const filters = [];

  if (isAdmin) {
    columns.push("source");
    columns.push("publish");
    filters.push("source");
  }

  return (
    <Card title={`Assigned Idioms @ ${editor || (isAdmin ? "admin" : "")}`}>
      <Assignments
        report={report}
        columns={columns}
        tools={tools}
        filters={filters}
        editor={editor}
        onSelectRow={onSelectRow}
      />
      <AssignmentForm
        idiom={selectedIdiom}
        show={showModal}
        onClose={handleCloseModal}
      />
    </Card>
  );
}
