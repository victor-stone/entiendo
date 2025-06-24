import chatMD from '../../../docs/chat.md?raw';
import Markdown from 'react-markdown';
import { Card } from '../components/layout';
import './markdown.css';

function Chat() {
    return(
        <Card title={<span><i>Entiendo</i> Chatbot </span>}>
            <Card.Body>
                <div id="deTailWind">
                    <Markdown>{chatMD}</Markdown>
                </div>
            </Card.Body>
        </Card>
    )
}

export default Chat;