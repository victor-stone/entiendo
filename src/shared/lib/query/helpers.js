import usageRangeOptions from '../../constants/usageRanges.js';

export function usageToPathRange(usage) {
    if (!usage) {
        return '';
    }
    const { lo, hi } = usageRangeOptions.find(({ value }) => value === usage);
    return `.usage >= ${lo} && .usage <= ${hi}`;
}
