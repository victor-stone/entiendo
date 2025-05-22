import * as icons from '@heroicons/react/24/solid';

const Glyph = ({name}) => {
  const Icon = icons[name];
  return Icon && <Icon className="w-5 h-5 inline opacity-50 mr-1" />;
};

export default Glyph;