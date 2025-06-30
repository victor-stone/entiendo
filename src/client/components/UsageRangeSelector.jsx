// UsageRangeSelector component
import usageOptions from '../../shared/constants/usageRanges';

export default function UsageRangeSelector({ value = "", onChange }) {
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {usageOptions.map(opt => (
                <label
                    key={opt.value}
                    className={`inline-flex items-center px-3 py-1 rounded-full border border-gray-300 dark:text-accent-900 bg-white shadow-sm cursor-pointer transition
                        ${value === opt.value ? "border-blue-500 bg-blue-50 text-blue-700 font-bold" : "hover:border-blue-300"}
                    `}>
                    <input
                        type="radio"
                        name="usage"
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={() => onChange(opt.value)}
                        className="accent-blue-600 mr-2 "
                    />
                    <span>{opt.label}</span>
                </label>
            ))}
        </div>
    );
}

