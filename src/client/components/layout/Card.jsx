import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'; 
import * as icons from '@heroicons/react/24/solid'; 
import { Link } from 'react-router-dom';

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

function CardBody({ children, className, style }) {
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

export const CardField = ({ children, hint, isFull = true }) => (
  <div className="mb-3 border-b border-gray-200 dark:border-gray-700 p-5">
    <div className={isFull ? 'w-full' : 'w-fit'}>
      {children}
    </div>
    {hint && (
      <div className="w-full text-xs text-gray-500 mt-2">
        {hint}
      </div>
    )}
  </div>
);

function CardSection({ title, children, className = '' }) {
  return (
    <section className={`py-4 px-1 border-t border-gray-200 last:mb-0 ${className}`}>
      {title && (
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">{title}</h2>
      )}
      {children}
    </section>
  );
}
const CardPanel = ({ children, title }) => (
  <div className="mb-6">
    {title && <h3 className="font-medium mb-2">{title}:</h3>}
    {children}
  </div>
);

// const CardInfo = ({ title, info }) => (
//   <div className="mb-1">
//     <span className="text-sm font-medium">{title}: </span>
//     <span className="text-sm">{info}</span>
//   </div>
// );

const CardInfo = ({ text, icon: Icon, iconName, color, label, link }) => {
  if (iconName) {
    Icon = icons[iconName];
  }
  return text && <div className={`inline-flex items-center gap-1 text-xs 
                            font-medium px-2 py-0.5  
                            ${color || defColor} 
                            mr-2`}>
    {Icon && <Icon className="w-4 h-4" />}
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
