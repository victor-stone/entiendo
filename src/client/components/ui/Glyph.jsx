import * as icons from '@heroicons/react/24/solid';

const Glyph = ({name, className = "w-5 h-5 inline opacity-50 mr-1 "}) => {
  const Icon = icons[name];
  return Icon && <Icon className={className} />;
};

export default Glyph;