import React from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Container, Title, Text, Button } from '@mantine/core';

// Placeholder components for each role's dashboard
const HeadOfficeDashboard = () => (
    <Container>
        <Title order={2}>Head Office Dashboard</Title>
        <Text>Welcome to the central control panel. You have administrative access to all branches and can manage system-wide settings.</Text>
    </Container>
);

const ManagerDashboard = () => (
    <Container>
        <Title order={2}>Manager Dashboard</Title>
        <Text>Manage your branch's team, schedule, and operations here. You can assign shifts and invite new employees.</Text>
    </Container>
);

const EmployeeDashboard = () => (
    <Container>
        <Title order={2}>Employee Dashboard</Title>
        <Text>View your upcoming shifts and manage your personal details.</Text>
    </Container>
);

const NoRoleDashboard = () => (
    <Container>
        <Title order={2}>Access Denied</Title>
        <Text>Your account does not have a defined role. Please contact your administrator for assistance.</Text>
    </Container>
);

const Dashboard = () => {
    const { user, logout } = useAuth();

    // Show a loading state while fetching user data
    if (!user) {
        return <Text>Loading...</Text>;
    }

    // Determine which component to render based on the user's role
    const renderDashboard = () => {
        switch (user.role) {
            case 'head_office':
                return <HeadOfficeDashboard />;
            case 'manager':
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
            
            {/* Render the dashboard based on the user's role */}
            {renderDashboard()}

            <Button onClick={logout} mt="xl" fullWidth>
                Logout
            </Button>
        </Container>
    );
};

export default Dashboard;
