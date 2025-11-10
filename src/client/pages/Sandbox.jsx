import { useEffect, useState } from "react";
import { useBrandImageStore } from "../stores";
import { Card } from '../components/layout';
import { ButtonBar, Grid } from "../components/ui";
import SandboxCard from "../components/sandbox/SandboxCard";
import img2 from "../assets/images/blocks.png";

// TODO: redo all of sandbox stuff

const SandboxIntro = ({click}) => (
    <Card title="Missed Words Practice">
        <Card.Body>
                <div><img src={img2} className="w-20 h-20 object-contain mx-auto" /></div>
                <div className="mx-auto text-center">Practice words that you missed.</div>
            <ButtonBar>
                <button className="btn btn-accent" onClick={click}>Start...</button>
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
        {mode == 'intro' && <SandboxIntro click={() => setMode('drill')} />}
        {mode == 'drill' && <SandboxCard  />}
        </>
    );
}

export default Sandbox;