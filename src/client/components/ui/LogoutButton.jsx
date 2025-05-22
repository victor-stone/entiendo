// AuthButton.jsx with Zustand
import React from 'react';
import { useUserStore } from '../../stores';

const LogoutButton = () => {
  const logout = useUserStore(state => state.logout);
  
  return (
    <button 
      onClick={logout} 
      className="btn btn-primary"
    >
      Logout
    </button>
  );
};

export default LogoutButton;