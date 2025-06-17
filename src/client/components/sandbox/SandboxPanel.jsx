const SandboxPanel = ({scheduleStats}) => {
  if( !scheduleStats  ) {
    return <p></p>
  }

  const { missed, unique } = scheduleStats;
    
  if( !missed) return <p>You haven't missed any words!</p>;

  return <p>You missed {unique} words {missed} times. </p>;
}

export default SandboxPanel;
