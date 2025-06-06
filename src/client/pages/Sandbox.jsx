import { useEffect, useState } from "react";
import { useProgressQuery, useUserStore, useBrandImageStore } from "../stores";
import { Card } from '../components/layout';
import { LoadingIndicator, ButtonBar } from "../components/ui";
import SandboxCard from "../components/sandbox/SandboxCard";

const T = ({children}) => <p style={{
                        width: '20%',
                        float: 'right',
                        marginLeft: '1.5em',
                    }}>{children}</p>;

const SandboxIntro = ({click}) => (
    <Card title="Practice Sandbox">
        <Card.Body>
            <div className="space-y-4">
                <T>When you no longer have any exercises as part of your schedule calendar, 
                    this is where you come to practice the words you've misheard</T>
                <T>It works on your auditory perception of the language.</T>
                <T><span className="bold italic">You'll never learn a language if you don't know how it sounds.</span></T>
                <T>These exercises are not tracked. You either get them or you don't. 
                    There is no keeping score. You do it until you understand it. 
                </T>
                <T>
                <ButtonBar>
                <button className="btn btn-accent" onClick={click}>Start...</button>
                </ButtonBar>
                </T>
            </div>
        </Card.Body>
    </Card>
);

const Sandbox = () => {
    const [ mode, setMode ] = useState('intro');
    const getToken = useUserStore(s => s.getToken);
    const { query, loading, error, fetch } = useProgressQuery();
    const { setImage } = useBrandImageStore();

    useEffect( () => {
        setImage('sandbox');
        if( !query && !loading ) {
            fetch(getToken);
        }
        return () => setImage('logo');
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