const SandboxPanel = ({dueStats}) => {
  if( !dueStats  ) {
    return <p></p>
  }

  const { missed, unique } = dueStats;
    
  if( !missed) return <p>You haven't missed any words!</p>;

  return <p>You missed {unique} words {missed} times. </p>;
}

export default SandboxPanel;
