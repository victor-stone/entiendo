import { useEffect, useState } from "react";
import { useProgressQuery, useUserStore, useBrandImageStore } from "../stores";
import { Card } from '../components/layout';
import { LoadingIndicator, ButtonBar, Grid } from "../components/ui";
import SandboxCard from "../components/sandbox/SandboxCard";
import img1 from "../assets/images/soldier.png"
import img2 from "../assets/images/blocks.png";
import img3 from "../assets/images/doll.png";

const SandboxIntro = ({click}) => (
    <Card title="Practice Playroom">
        <Card.Body>
            <Grid columns={3} className="place-items-center text-center">
                <div><img src={img1} alt="Ice Cream" className="w-20 h-20 object-contain mx-auto" /></div>
                <div><img src={img2} alt="Clock" className="w-20 h-20 object-contain mx-auto" /></div>
                <div><img src={img3} alt="Doll" className="w-20 h-20 object-contain mx-auto" /></div>
                <div>When you no longer have any exercises as part of your schedule calendar, 
                    this is where you come to practice the words you've misheard</div>
                <div><span className="bold italic">You'll never learn a language if you don't know how it sounds.</span></div>
                <div>These exercises are not tracked. You either get them or you don't. 
                    There is no keeping score. You do it until you understand it. 
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
    const getToken = useUserStore(s => s.getToken);
    const { query, loading, error, fetch } = useProgressQuery();
    const { setImage } = useBrandImageStore();

    useEffect( () => {
        setImage('blocks');
        if( !query && !loading ) {
            fetch(getToken);
        }
    }, [query]);

    if( error ) {
        return <p className="text-red-500">{error}</p>;
    }
    
    if( loading ) {
        return <LoadingIndicator />
    }

    if (!query) {
        return <div>No query available</div>;
    }

    return (
        <>
        {mode == 'intro' && <SandboxIntro query={query} click={() => setMode('drill')} />}
        {mode == 'drill' && <SandboxCard query={query} />}
        </>
    );
}

export default Sandbox;