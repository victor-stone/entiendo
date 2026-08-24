import {
  VOICE_TYPE,
  VOICE_CONVERSATION,
  VOICE_EDUCATION,
  normalizeVoiceType
} from "../../shared/constants/voiceTypes";

export const voiceOptions = [
  {
    value: VOICE_CONVERSATION,
    label: 'Conversational (more difficult to understand)'
  },
  {
    value: VOICE_EDUCATION,
    label: 'Educational (slower, clearer)'
  }
];

export function VoiceOptions({ value = VOICE_CONVERSATION, onChange }) {
  const handleChange = value => onChange(VOICE_TYPE, value);
  const selectedValue = normalizeVoiceType(value);

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {voiceOptions.map(opt => (
                <label
                    key={opt.value}
                    className={`inline-flex items-center px-3 py-1 rounded-full border border-gray-300 dark:text-accent-900 bg-white shadow-sm cursor-pointer transition
                        ${selectedValue === opt.value ? "border-blue-500 bg-blue-50 text-blue-700 font-bold" : "hover:border-blue-300"}
                    `}>
                    <input
                        type="radio"
                        name={VOICE_TYPE}
                        value={opt.value}
                        checked={selectedValue === opt.value}
                        onChange={() => handleChange(opt.value)}
                        className="accent-blue-600 mr-2 "
                    />
                    <span>{opt.label}</span>
                </label>
            ))}
        </div>
    );
}

export { VOICE_TYPE };
