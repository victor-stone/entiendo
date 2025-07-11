import { Link } from 'react-router-dom';

const linkCss = "btn btn-primary mt-3 inline-block" // "hover:opacity-90 font-bold py-1 px-3 rounded-md text-sm inline-block border border-gray-800 mt-4 mb-2"; // removed block and text-center

export default ({ page, text, className, onClick }) => (
  <Link to={page} className={className || linkCss} onClick={onClick} style={{fontSize: 'initial'}}>{text}</Link>
);
