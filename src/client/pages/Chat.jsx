import chatMD from '../../../docs/chat.md?raw';
import { MD } from '../components/ui';
import { Card } from '../components/layout';
import './markdown.css';

function Chat() {
    return(
        <Card title={<span><i>Entiendo</i> Chatbot </span>}>
            <Card.Body>
                <div id="deTailWind">
                    <MD>{chatMD}</MD>
                </div>
            </Card.Body>
        </Card>
    )
}

export default Chat;