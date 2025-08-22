import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear tokens and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <div>
      <h2>Welcome to RotaIQ Dashboard!</h2>
      <p>This is where you'll see all the available shifts.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;