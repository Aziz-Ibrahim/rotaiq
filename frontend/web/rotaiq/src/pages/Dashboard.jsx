import React from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Container, Title, Text, Button } from '@mantine/core';

// Import the role-specific dashboard components
import HeadOfficeDashboard from '../components/HeadOfficeDashboard.jsx';
import ManagerDashboard from '../components/ManagerDashboard.jsx';
import EmployeeDashboard from '../components/EmployeeDashboard.jsx';
import NoRoleDashboard from '../components/NoRoleDashboard.jsx';

// New import for the RegionManagerDashboard
import RegionManagerDashboard from '../components/RegionManagerDashboard.jsx';

const Dashboard = () => {
    const { user, logout, loading: authLoading } = useAuth();

    if (authLoading) {
        return <Text>Loading user data...</Text>;
    }

    if (!user) {
        return <NoRoleDashboard />;  //TODO: redirect to login
    }

    const renderDashboard = () => {
        switch (user.role) {
            case 'head_office':
                return <HeadOfficeDashboard />;
            case 'region_manager':
                return <RegionManagerDashboard />;
            case 'manager':
            case 'branch_manager':
                return <ManagerDashboard />;
            case 'employee':
                return <EmployeeDashboard />;
            default:
                return <NoRoleDashboard />;
        }
    };

    return (
        <Container size="md" my={40}>
            <Title align="center">
                Hello, {user.first_name}!
            </Title>
            <Text align="center" mt="md" mb="lg">
                Your role is: {user.role}
            </Text>
            
            {renderDashboard()}

            <Button onClick={logout} mt="xl" fullWidth>
                Logout</Button>
        </Container>
    );
};

export default Dashboard;
