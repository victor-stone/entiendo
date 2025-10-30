import { Card } from "../../components/layout";
import Assignments from "../../components/editor/Assignments";

const columns = [
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
  return (
    <Card title="Assignment Manager">
      <Card.Body>
          <Assignments report="ASSIGNABLE_IDIOMS" columns={columns} filters={filters}/>
      </Card.Body>
    </Card>
  );
}
