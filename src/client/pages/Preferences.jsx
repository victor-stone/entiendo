import { useUserStore, useBrandImageStore } from "../stores";
import { Card, CardField } from '../components/layout';
import { PageLink, LoadingSpinner } from "../components/ui";
import { useEffect } from "react";
import { ToneSelectorField } from "../components/ToneSelector";
import UsageRangeSelector from "../components/UsageRangeSelector";

const hints = {
    usage: 'Prioritize which idioms you see based on how frequently they are used. "Super Common" means used all the time, "Super Rare" means it’s hardly ever used.',
    admin: 'Admin: Next example ID'
};

const Preferences = () => {
    const {
        preferences,
        setTone,
        setUsage,
        setPreference,
        loading,
        isAdmin,
        getToken
    } = useUserStore();

    const { setImage } = useBrandImageStore();

    useEffect(() => {
        setImage('icecream');
    }, [setImage])

    return (
        <Card title={<span>Preferences {loading ? <LoadingSpinner /> : ''}</span>}>
            <Card.Body>
                <CardField hint={hints.usage}>
                    <UsageRangeSelector value={preferences?.filter?.usage} onChange={setUsage} />
                </CardField>
                <ToneSelectorField getToken={getToken} value={preferences?.filter?.tone || ""} onChange={setTone} />
                {isAdmin &&
                    <CardField hint={hints.admin} title="Next Example">
                        <input
                            type="text"
                            className="border rounded px-2 py-1 w-full dark:text-primary-900 "
                            value={preferences?.getNextExample || ""}
                            onChange={e => setPreference('getNextExample', e.target.value)}
                            placeholder="Enter exampleId"
                        />
                    </CardField>
                }
                <CardField>
                    <div className="flex gap-4">
                        <PageLink page="/app/dashboard" text="Dashboard" />
                    </div>
                </CardField>
            </Card.Body>
        </Card>
    );
};

export default Preferences;