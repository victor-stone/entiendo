import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'; 
import * as icons from '@heroicons/react/24/solid'; 
import { Link } from 'react-router-dom';
import Grid from '../ui/Grid';

const defColor = 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200';

function CardHeader({ children, title }) {
    return (
        <div className="card-header bg-gradient-primary text-white">
            <h1 className="text-2xl font-bold flex justify-between items-center">
                {title}
                {children}
            </h1>
        </div>
    )
}

function CardBody({ children, className = '', style }) {
    return (
        <div style={style} className={`card-body ${className}`}>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full ">
                    {children}
                </div>
            </div>
        </div>
    )
}

export const CardField = ({ children, hint, title, text, isFull = true }) => (
  <div className="mt-4">
    {title && <label className="block mb-1 font-bold">{title}</label>}
    <div className={isFull ? 'w-full' : 'w-fit'}>
      {text}
      {children}
    </div>
    {hint && (
      <div className="w-full text-xs text-gray-500 mt-2">
        {hint}
      </div>
    )}
  </div>
);

const CardGrid = ({children, className, style, columns = 2}) => {
  // For 2 columns, set first to 25% and second to 75%
  const gridTemplate = columns === 2 ? { gridTemplateColumns: '25% 75%' } : {};
  return <Grid columns={columns} className={className} style={{...gridTemplate, ...style}}>{children}</Grid>
}

const CardGridLabel = ({ title, right = true, css = '' }) => (
  <div>
    <label className={`${css} font-bold ${right ? 'text-right' : ''} w-full block`}>{title}</label>
  </div>
);

const CardGridField = ({ children, hint }) => <div>
  {children}
  {hint && (
    <div className="w-full text-xs text-gray-500 mt-2">
      {hint}
    </div>
  )}
</div>;

function CardSection({ title, children, className = '' }) {
  return (
    <section className={`py-4 px-1 w-full ${className}`}>
      {title && (
        <h2 className="text-lg font-semibold text-primary-700 dark:text-primary-200 mb-3 tracking-tight border-b border-primary-200 dark:border-primary-700 pb-1">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

const CardPanel = ({ children, title }) => (
  <div className="mb-6">
    {title && <h3 className="mb-2 text-xl font-bold">{title}</h3>}
    {children}
  </div>
);

// const CardInfo = ({ title, info }) => (
//   <div className="mb-1">
//     <span className="text-sm font-medium">{title}: </span>
//     <span className="text-sm">{info}</span>
//   </div>
// );

const CardInfo = ({ 
  text, 
  icon: Icon, 
  iconName, 
  color, 
  label, 
  link, 
  inline = false,
  className
}) => {
  if (iconName) {
    Icon = icons[iconName];
  }
  const blockage = inline ? 'inline-' : '';
  return text && <div className={`${blockage}flex items-center gap-1 text-xs 
                            font-medium px-2 py-0.5  
                            ${color || defColor} 
                            mr-2 ${className}`}>
    {Icon && <Icon className="text-primary-500 w-4 h-4" />}
    {label && <label>{label}</label>}
    {text}
    { link && <Link to={link}><ArrowTopRightOnSquareIcon className="w-4 h-4" /></Link>}
    </div>
}

export function Card({ children, title }) {
    return (
        <div className="card mb-6">
          {title && <CardHeader>{title}</CardHeader>}
            {children}
        </div>
    );
}

Card.Body = CardBody;
Card.Info = CardInfo;
Card.Panel = CardPanel;
Card.Section = CardSection;
Card.Field = CardField;
Card.Grid = CardGrid;
Card.GridLabel = CardGridLabel;
Card.GridField = CardGridField;
