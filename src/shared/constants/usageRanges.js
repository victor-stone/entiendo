const usageRangeOptions = [
    { value: "",             label: "All",          lo: 0, hi: 0,  icon: '' },
    { value: "super_common", label: "Super Common", lo: 8, hi: 10, icon: 'ChartBarIcon' },
    { value: "common",       label: "Common",       lo: 5, hi: 7,  icon: 'Bars3BottomLeftIcon' },
    { value: "uncommon",     label: "Uncommon",     lo: 3, hi: 4,  icon: 'Bars3Icon' },
    { value: "super_rare",   label: "Super Rare",   lo: 1, hi: 2,  icon: 'SlashIcon' }
];

export default usageRangeOptions;

export function usageToRange(v) {
	v = Number(v);
	return usageRangeOptions.find(({lo, hi}) => (v >= lo && v <= hi) );
}

export function valueToRange(v) {
	return usageRangeOptions.find(({value}) => value === v);
}

export const USAGE_DEFAULT = 'super_common';

/*
distribution of usage scores across idioms:
	•	2 → 35 idioms   super_rare (1,2)
	•	3 → 31 idioms   uncommon (3,4)
	•	5 → 14 idioms   common (5,6,7)
	•	6 → 4 idioms    
	•	7 → 92 idioms
	•	8 → 196 idioms  super_common (8,9,10)
	•	10 → 95 idioms  

*/
