import { useEffect } from 'react';
import aboutMD from '../../../docs/about.md?raw';
import { Card } from '../components/layout';
import { useBrandImageStore } from '../stores';
import { MD } from '../components/ui';
import './markdown.css';

function About() {
    const { setImage } = useBrandImageStore();

    useEffect(() => {
        setImage('brain');
    }, [setImage])

    return (
        <Card title={<span>Stuff to Know About <i>Entiendo</i></span>}>
            <Card.Body>
                <div id="deTailWind">
                    <MD>{aboutMD}</MD>
                </div>
            </Card.Body>
        </Card>
    )
}

export default About;