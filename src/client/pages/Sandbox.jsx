import { useEffect, useState } from "react";
import { useBrandImageStore } from "../stores";
import { Link } from "react-router-dom";
import { Card } from '../components/layout';
import { ButtonBar  } from "../components/ui";
import SandboxCard from "../components/sandbox/SandboxCard";
import SandboxSelectCard from "../components/sandbox/SanboxSelectCard";
import img2 from "../assets/images/blocks.png";


const SandboxIntro = ({click}) => (
    <Card title="Missed Words Practice">
        <Card.Body>
                <div><img src={img2} className="w-20 h-20 object-contain mx-auto" /></div>
                <div className="mx-auto text-center">Practice words that you missed.</div>
            <ButtonBar>
                <Link to="/app/dashboard" className="btn mr-4">Dashboard</Link>
                <button className="btn btn-accent mr-4" onClick={() => click('drill')}>Random</button>
                <button className="btn btn-accent" onClick={() => click('select')}>Select</button>
            </ButtonBar>
        </Card.Body>
    </Card>
);

const Sandbox = () => {
    const [ mode, setMode ] = useState('intro');
    const { setImage } = useBrandImageStore();

    useEffect( () => {
        setImage('blocks');
    },[setImage]);

    return (
        <>
        {mode == 'intro'  && <SandboxIntro click={(mode='') => setMode(mode)} />}
        {mode == 'drill'  && <SandboxCard missedWords={[]} />}
        {mode == 'select' && <SandboxSelectCard />}
        </>
    );
}

export default Sandbox;