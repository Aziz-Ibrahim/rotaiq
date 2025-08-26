// src/components/Dashboard.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Text } from '@mantine/core';

// Import all dashboard components
import EmployeeDashboard from '../components/EmployeeDashboard';
import FloatingEmployeeDashboard from '../components/FloatingEmployeeDashboard';
import ManagerDashboard from '../components/ManagerDashboard';
import RegionManagerDashboard from '../components/RegionManagerDashboard';
import HeadOfficeDashboard from '../components/HeadOfficeDashboard';

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Text>Loading...</Text>;
    }

    if (!user) {
        return <Text>Please log in to view the dashboard.</Text>;
    }

    // Conditionally render the correct dashboard based on user role
    const renderDashboard = () => {
        switch (user.role) {
            case 'employee':
                return <EmployeeDashboard />;
            case 'floating_employee':
                return <FloatingEmployeeDashboard />;
            case 'branch_manager':
                return <ManagerDashboard />;
            case 'region_manager':
                return <RegionManagerDashboard />;
            case 'head_office':
                return <HeadOfficeDashboard />;
            default:
                return <Text>Your user role does not have an assigned dashboard.</Text>;
        }
    };

    return renderDashboard();
};

export default Dashboard;
