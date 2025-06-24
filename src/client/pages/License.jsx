import licenseMD from '../../../docs/license.md?raw';
import Markdown from 'react-markdown';
import { Card } from '../components/layout';
import './markdown.css';

const CC = () => (
  <div id="cc-info">
    <a href="http://entiendo.app">Entiendo</a> © 2025 by{' '}
    <a href="https://creativecommons.org">Victor Stone</a> is licensed under{' '}
    <a href="https://creativecommons.org/licenses/by-sa/4.0/">
      Creative Commons Attribution-ShareAlike 4.0 International
    </a>
    <img
      src="https://mirrors.creativecommons.org/presskit/icons/cc.svg"
      style={{ maxWidth: '1em', maxHeight: '1em', marginLeft: '.2em' }}
      alt="CC"
    />
    <img
      src="https://mirrors.creativecommons.org/presskit/icons/by.svg"
      style={{ maxWidth: '1em', maxHeight: '1em', marginLeft: '.2em' }}
      alt="BY"
    />
    <img
      src="https://mirrors.creativecommons.org/presskit/icons/sa.svg"
      style={{ maxWidth: '1em', maxHeight: '1em', marginLeft: '.2em' }}
      alt="SA"
    />
  </div>
);

function License() {
    return(
        <Card title={<span>License Stuff</span>}>
            <Card.Body>
                <div id="deTailWind">
                    <Markdown>{licenseMD}</Markdown>
                    <CC />
                </div>
            </Card.Body>
        </Card>
    )
}

export default License;