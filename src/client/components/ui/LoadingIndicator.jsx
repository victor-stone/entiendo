
const LoadingIndicator = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col justify-center items-center h-40 w-full">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600 mb-3"></div>
      <p className="text-primary-700 font-medium">{message}</p>
    </div>
  );
};

export default LoadingIndicator; 

export const LoadingSpinner = ({ size = 16, className = '' }) => (
  <span
    className={`inline-block align-middle animate-spin rounded-full border-t-2 border-b-2 border-primary-600 ${className}`}
    style={{ width: size, height: size }}
    aria-label="Loading"
  />
);
