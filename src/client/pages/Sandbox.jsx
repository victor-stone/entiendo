import { useEffect } from "react";
import { useProgressQuery, useUserStore } from "../stores";
import { Card } from '../components/layout';

const Sandbox = () => {
    const getToken = useUserStore(s => s.getToken);
    const { query, loading, error, fetch } = useProgressQuery();

    useEffect( () => {
        if( !query && !loading ) {
            fetch(getToken);
        }
    }, [query]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message || String(error)}</div>;
    if (!query) return <div>No query available</div>;

    // Example: render something from query.data
    return (
        <Card title="Practice Sandbox">
            <Card.Body>
                <p>This is where you practice the words you've misheard 
                    and didn't hear correctly. 
                </p>

            </Card.Body>
        </Card>
        // <div>
        //     <h2>Sandbox</h2>
        //     <pre>{JSON.stringify(query.missedWordsByMistakeType(), null, 2)}</pre>
        // </div>
    );
}

export default Sandbox;