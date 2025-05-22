import { useUserStore } from "../../stores";
import ToneSelector from "./ToneSelector";
import UsageRangeSelector from "./UsageRangeSelector";
import { CardBody, Card, CardHeader, CardField } from '../layout';
import { LoadingSpinner } from "../ui/LoadingIndicator";
import toneDescriptions from "../../../shared/constants/toneDescriptions";
import { PageLink } from "../ui";

const hints = {
    tone  : 'A context the idiom is likely to be use in.',
    usage : 'Based on how frequently this idiom is used. "Super Common" means used all the time, "Super Rare" means it’s hardly ever used.'
};

const IdiomSelector = () => {
    const {
        preferences,
        setTone,
        setUsage,
        loading
     } = useUserStore();

    return (
        <Card>
            <CardHeader>
                Select Idioms {loading && <LoadingSpinner />}
            </CardHeader>
            <CardBody>
                <CardField hint={hints.usage}>
                    <UsageRangeSelector value={preferences?.filter?.usage} onChange={setUsage} />
                </CardField>
                <CardField hint={hints.tone}>
                    <ToneSelector value={preferences?.filter?.tone || ""} onChange={setTone} />
                </CardField>
                {
                    toneDescriptions[preferences.filter.tone] &&
                    <CardField>{toneDescriptions[preferences.filter.tone].map((t,i) => <p key={i} className="mb-1">{t}</p>)}</CardField>
                }
                <CardField>
                    <div className="flex gap-4">
                        <PageLink page="/app/dashboard" text="Dashboard" />
                        <PageLink page="/app/exercise" text="Start Exercise" />
                    </div>
                </CardField>
            </CardBody>
        </Card>
    );
};

export default IdiomSelector;