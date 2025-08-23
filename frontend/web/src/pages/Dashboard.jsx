import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ManagerDashboard from '../components/ManagerDashboard';
import EmployeeDashboard from '../components/EmployeeDashboard';

const Dashboard = () => {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>Welcome, {user.first_name || user.email}!</h2>
                <button onClick={handleLogout}>Logout</button>
            </header>
            <main className="dashboard-main">
                {user.role === 'manager' ? (
                    <ManagerDashboard />
                ) : (
                    <EmployeeDashboard />
                )}
            </main>
        </div>
    );
};

export default Dashboard;