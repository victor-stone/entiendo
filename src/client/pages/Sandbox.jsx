import { useEffect, useState } from "react";
import { useBrandImageStore } from "../stores";
import { Card } from '../components/layout';
import { ButtonBar, Grid } from "../components/ui";
import SandboxCard from "../components/sandbox/SandboxCard";
import img1 from "../assets/images/soldier.png"
import img2 from "../assets/images/blocks.png";
import img3 from "../assets/images/doll.png";

// TODO: redo all of sandbox stuff

const SandboxIntro = ({click}) => (
    <Card title="Practice Playroom">
        <Card.Body>
            <Grid columns={3} className="place-items-center text-center">
                <div><img src={img1} alt="Ice Cream" className="w-20 h-20 object-contain mx-auto" /></div>
                <div><img src={img2} alt="Clock" className="w-20 h-20 object-contain mx-auto" /></div>
                <div><img src={img3} alt="Doll" className="w-20 h-20 object-contain mx-auto" /></div>
                <div>Finished with your calendar for now? This is where you come to practice the words you've misheard.</div>
                <div></div>
                <div>There is no keeping score. You either get them or you don't. 
                    You do it until you understand it. 
                </div>
            </Grid>
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