import { useEffect, useState } from "react";
import { useProgressQuery, useUserStore, useBrandImageStore } from "../stores";
import { Card } from '../components/layout';
import { LoadingIndicator } from "../components/ui";
import SandboxCard from "../components/sandbox/SandboxCard";


const SandboxIntro = ({click}) => (
    <Card title="Practice Sandbox">
        <Card.Body>
            <div>
                <p>This is where you practice the words you've misheard</p>
                <button className="btn" onClick={click}>Start...</button>
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