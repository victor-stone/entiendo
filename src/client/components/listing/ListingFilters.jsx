import ListSearch from "../ui/ListSearch";
import ToneSelector from "../ToneSelector";
import UsageSelector from "../admin/UsageSelector";

export const ListingFilters = [
	{
		name: "text",
		defaultValue: "",
		render: (value, setValue) => (
			<ListSearch
				searchTerm={value}
				setSearchTerm={setValue}
				placeholder="Search idioms..."
			/>
		),
		filter: (row, value) =>
			!value ||
			row.text?.toLowerCase().includes(value.toLowerCase()) ||
			row.translation?.toLowerCase().includes(value.toLowerCase()),
	},
	{
		name: "tone",
		defaultValue: "all",
		render: (value, setValue, { getToken }) => (
			<ToneSelector
				getToken={getToken}
				value={value === "all" ? "" : value}
				onChange={(val) => setValue(val === "" ? "all" : val)}
				required={false}
			/>
		),
		filter: (row, value) => value === "all" || row.tone === value,
	},
	{
		name: "usage",
		defaultValue: "all",
		render: (value, setValue) => (
			<UsageSelector value={value} onChange={setValue} />
		),
		filter: (row, value) => value === "all" || String(row.usage) === value,
	},
];
