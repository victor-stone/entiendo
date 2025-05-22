const Badge = ({ children }) => (
    <span className="inline w-fit bg-gray-400 dark:bg-white text-white dark:text-gray-900 text-xs px-2 py-0.5 rounded-md flex items-center justify-center">
        {children}
    </span>
);

export default Badge;
