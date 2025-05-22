// AuthButton.jsx with Zustand
import React from 'react';
import { useUserStore } from '../../stores';

const LoginButton = () => {
  const login = useUserStore(state => state.login);
  
  return (
    <button 
      onClick={login} 
      className="btn btn-primary"
    >
      Login / Signup
    </button>
  );
};

export default LoginButton;