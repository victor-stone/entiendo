import { useParams } from "react-router-dom";
import AudioManager from "../../components/admin/AudioManager";
import { Card } from "../../components/layout";
import { useState } from "react";
import Assignments from "../../components/editor/Assignments";
import { TabButtons } from "../../components/ui";

const columns = [
  'sync',
  'text',
  'tone',
  'usage',
  'assign'
];

const filters = [
  'text',
  'tone',
  'usage',
  'source'
];

export default function AssignmentManagerPage() {
  const { exampleId } = useParams();
  const [activeTab, setActiveTab] = useState("assignments");

  const tabs = [
    { key: "assignments", label: "Assignable" },
    { key: "upload", label: "Audio Uploader" },
  ];

  return (
    <Card title="Manage Assignments">
      <TabButtons
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
      />
      <Card.Body>
        {activeTab === "upload" ? (
          <AudioManager exampleId={exampleId} />
        ) : (
          <Assignments report="ASSIGNABLE_IDIOMS" columns={columns} filters={filters}/>
        )}
      </Card.Body>
    </Card>
  );
}
