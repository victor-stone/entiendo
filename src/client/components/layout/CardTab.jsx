
// CardTab component that takes children
export function CardTab({ tabs, value, onChange, children }) {
    const tabBase     = "px-4 py-2 font-medium rounded-t-md focus:outline-none transition-colors border:1px solid white;";
    const tabActive   = "bg-white text-blue-600 mb-0";
    const tabInactive = "bg-gray-100 text-gray-500 hover:text-blue-600 border-b-2 border-transparent";
    return (
        <div>
            <nav
                className="flex space-x-2 mt-3 mb-0 border-b-2 border-white"
                aria-label="Tabs"
            >
                {tabs.map((t, idx) => (
                    <button
                        key={t.label}
                        className={`${tabBase} ${value === idx ? tabActive : tabInactive}`}
                        onClick={() => onChange(idx)}
                        aria-current={value === idx ? "page" : undefined}
                        type="button"
                    >
                        {t.label}
                    </button>
                ))}
            </nav>
            <div id="CardTabClient" className="bg-white p-[13px] mt-0">
                {Array.isArray(children) ? children[value] : children}
            </div>
        </div>
    );
}
