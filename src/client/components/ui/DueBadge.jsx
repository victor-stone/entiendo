import { format } from 'timeago.js';
import Badge from './Badge';

const DueBadge = ({ count, date }) => {
  if (count <= 0 && !date) return null;

  return (
    <Badge>{date ? `Due: ${format(date)}` : `${count} due`}</Badge>
  );
};

export default DueBadge; 