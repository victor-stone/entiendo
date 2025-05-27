import { useUserStore } from "../../stores";
import ToneSelector from "./ToneSelector";
import UsageRangeSelector from "./UsageRangeSelector";
import { Card, CardField } from '../layout';
import { LoadingSpinner } from "../ui/LoadingIndicator";
import toneDescriptions from "../../../shared/constants/toneDescriptions";
import { PageLink } from "../ui";
import { useEffect, useState } from 'react';
import { setFontClass } from "../../lib/fontLoader";
import FontPicker from '../ui/FontPicker';

const hints = {
    tone  : 'Prioritize which idioms you see based on the context they are likely to be used in.',
    usage : 'Prioritize which idioms you see based on how frequently they are used. "Super Common" means used all the time, "Super Rare" means it’s hardly ever used.'
};

const fontOptions = [
  { label: 'Nunito (Google)', value: 'nunito' },
  { label: 'Avenir Next (Apple)', value: 'avenir' },
  { label: 'Noto Sans (Google)', value: 'noto' }
];

const PreferencePanel = () => {
    const {
        preferences,
        setTone,
        setUsage,
        setPreference,
        loading,
        isAdmin
     } = useUserStore();

    const [font] = useState(() => {
      return localStorage.getItem('fontPref') || 'avenir';
    });

    // Also update when font changes
    useEffect(() => {
      setFontClass(font);
      localStorage.setItem('fontPref', font);
    }, [font]);

    return (
        <Card title={<span>Preferences {loading ? <LoadingSpinner /> : ''}</span>}>
            <Card.Body>
                <CardField hint={hints.usage}>
                    <UsageRangeSelector value={preferences?.filter?.usage} onChange={setUsage} />
                </CardField>
                <CardField hint={hints.tone}>
                    <ToneSelector value={preferences?.filter?.tone || ""} onChange={setTone} />
                </CardField>
                {
                    toneDescriptions[preferences.filter.tone] &&
                    <CardField>
                        <ul className="list-disc pl-5">
                        {toneDescriptions[preferences.filter.tone].map((t,i) => 
                            <li key={i} className="mb-1">{t}</li>)}
                        </ul>
                    </CardField>
                }
                <CardField hint="Choose your preferred font for the app.">
                  <FontPicker />
                </CardField>
                {isAdmin && 
                    <CardField hint="Admin: Next example ID">
                        <label className="block mb-1 font-medium">Next Example</label>
                        <input
                            type="text"
                            className="border rounded px-2 py-1 w-full"
                            value={preferences?.getNextExample || ""}
                            onChange={e => setPreference('getNextExample', e.target.value)}
                            placeholder="Enter next example value"
                        />
                    </CardField>
                }
                <CardField>
                    <div className="flex gap-4">
                        <PageLink page="/app/dashboard" text="Dashboard" />
                        <PageLink page="/app/exercise" text="Start Exercise" />
                    </div>
                </CardField>
            </Card.Body>
        </Card>
    );
};

export default PreferencePanel;