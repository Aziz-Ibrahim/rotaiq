import React from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Container, Title, Text, LoadingOverlay, Paper } from '@mantine/core';
import ShiftList from './ShiftList.jsx';

const EmployeeDashboard = ({ currentView }) => {
    const { user, loading } = useAuth();

    if (loading || !user) {
        return <LoadingOverlay visible={true} />;
    }

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return (
                    <Paper shadow="sm" p="lg" withBorder>
                        <Title order={2}>Employee Dashboard</Title>
                        <Text>Welcome back, {user.first_name}! Here are the available shifts.</Text>
                        <ShiftList viewType="open_shifts" />
                    </Paper>
                );
            case 'my-claims':
                return (
                    <Paper shadow="sm" p="lg" withBorder>
                        <Title order={2}>My Claims</Title>
                        <Text>View all the shifts you have claimed.</Text>
                        <ShiftList viewType="my_claims" />
                    </Paper>
                );
            default:
                return <Text>Select an option from the sidebar.</Text>;
        }
    };

    return (
        <Container fluid>
            {renderContent()}
        </Container>
    );
};

export default EmployeeDashboard;