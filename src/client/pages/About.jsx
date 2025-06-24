import aboutMD from '../../../docs/about.md?raw';
import Markdown from 'react-markdown';
import { Card } from '../components/layout';
import './markdown.css';

function About() {
    return(
        <Card title={<span>Stuff to Know About <i>Entiendo</i></span>}>
            <Card.Body>
                <div id="deTailWind">
                    <Markdown>{aboutMD}</Markdown>
                </div>
            </Card.Body>
        </Card>
    )
}

export default About;