import React from 'react';

const LoginButton = ({ user, signOut, onLogin, isZoomedIn }) => {
  return (
    <div className={`absolute top-4 right-4 z-50 transition-all duration-300 ${!isZoomedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {user ? (
        <button onClick={signOut} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          Sign Out
        </button>
      ) : (
        <button onClick={onLogin} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          Login
        </button>
      )}
    </div>
  );
};

export default LoginButton;
