import { useUserStore } from "../stores";
import { valueToRange } from "../../shared/constants/usageRanges";
import { LoadingIndicator } from "./ui";

const FilterToString = ({ filter, loading }) => {
    if( loading ) {
        return <LoadingIndicator />
    }

    if( !filter ) {
        return;
    }
    const features = [];
    if (filter.usage) {
        const range = valueToRange(filter.usage);
        features.push(
            <span key="usage"><b>{range.label}</b></span>
        );
    }
    if (filter.tone) {
        features.push(
            <span key="tone"><b>{filter.tone}</b></span>
        );
    }
    if (features.length) {
        // Add commas between features, but keep them as React elements
        const interleaved = [];
        features.forEach((feature, i) => {
            if (i > 0) interleaved.push(<span key={`comma-${i}`}> and </span>);
            interleaved.push(feature);
        });
        return <div>Your preferred idioms are {interleaved}</div>;
    }
    return <div>You are seeing all the idioms in the system.</div>;
};

export default function FilterInfo() {

    const { preferences, loading } = useUserStore();

    return (
            <FilterToString filter={preferences.filter} loading={loading} />
    );
}
