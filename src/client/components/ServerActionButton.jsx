import { useUserStore } from '../stores';

export default ServerActionButton = ({
    store, 
    onClick, 
    onComplete, 
    text = "Save", 
    actionText = "Saving", 
    className="btn btn-default"
}) => {
    const { action, error, loading, result, reset } = store;
    const { getToken } = useUserStore();

    function handleClick() {
        const params = onClick && onClick();
        action(params, getToken);
    }

    // if(error)
    return <button className={className} onClick={handleClick}>
        {loading ? {actionText} : {text}}
    </button>
}