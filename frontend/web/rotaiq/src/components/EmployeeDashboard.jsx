import React from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Container, Title, Text } from '@mantine/core';
import ShiftList from './ShiftList.jsx';

const EmployeeDashboard = ({ currentView }) => {
    const { user } = useAuth();

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return (
                    <>
                        <Title order={2}>Employee Dashboard</Title>
                        <Text>Welcome back, {user.first_name}! Here are the available shifts.</Text>
                        <ShiftList viewType="open_shifts" />
                    </>
                );
            case 'my-claims':
                return (
                    <>
                        <Title order={2}>My Claims</Title>
                        <Text>View all the shifts you have claimed.</Text>
                        <ShiftList viewType="my_claims" />
                    </>
                );
            default:
                return <Text>Select an option from the sidebar.</Text>;
        }
    };

    return (
        <Container>
            {renderContent()}
        </Container>
    );
};

export default EmployeeDashboard;