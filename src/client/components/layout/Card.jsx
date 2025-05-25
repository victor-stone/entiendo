export function Card({ children }) {
    return (
        <div className="card mb-6">
            {children}
        </div>
    );
}

export function CardHeader({ children }) {
    return (
        <div className="card-header bg-gradient-primary text-white">
            <h1 className="text-2xl font-bold flex justify-between items-center">
                {children}
            </h1>
        </div>
    )
}

export function CardBody({ children, className, style }) {
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

// 
export function CardBlock({ 
  className = '', 
  children, 
  title = '', 
  border=true,
  background=true
}) {
  return (
    <div className={`inline-block my-6 ml-4 rounded-lg shadow 
                    ${border && "border border-gray-300 dark:border-gray-700"} 
                    ${className}`} 
          style={ background && { background: 'rgba(249, 250, 251, 0.8)' }}
    >
      {title && <CardBlockHeader>{title}</CardBlockHeader>}
      {children}
    </div>
  );
}

export function CardBlockHeader({ children }) {
  return (
    <div className="px-5 pt-4 pb-2">
      <h2 className="text-base font-semibold text-gray-600 dark:text-gray-200 text-center mb-1">
        {children}
      </h2>
    </div>
  );
}

export function CardBlockBody({ children }) {
  return (
    <div className="px-5 pb-4 pt-4">
      {children}
    </div>
  );
}