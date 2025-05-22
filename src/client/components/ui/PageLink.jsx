import { Link } from 'react-router-dom';

const linkCss = "hover:opacity-90 font-bold py-1 px-3 rounded-md text-sm block border border-gray-800 mt-4 mb-2 text-center";

export default ({ page, text, className, onClick }) => (
  <Link to={page} className={className || linkCss} onClick={onClick}>{text}</Link>
);
