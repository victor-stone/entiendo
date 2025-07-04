import { CopyToClipboardButton } from '../../components/ui';
import { escapeCSV } from '../../lib/escapeCSV';

export default function CSVtoClipboard({ filtered }) {
    function getValue() {
        const rows = [];
        const idioms = filtered;
        for (let i = 0; i < idioms.length; i++) {
            const { text, translation, assigned: { source, sync } = {} } = idioms[i];
            const str = `${source || ''},${sync || ''},${escapeCSV(text)},${escapeCSV(translation)}`;
            rows.push(str);
        }
        return 'voice,num,text,translation\n' + rows.join('\n');
    }
    return <CopyToClipboardButton getValue={getValue} title="CSV" />;
}