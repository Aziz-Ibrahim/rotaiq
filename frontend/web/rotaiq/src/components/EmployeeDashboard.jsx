import React from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Container, Title, Text, LoadingOverlay } from '@mantine/core';
import ShiftList from './ShiftList.jsx'; // This is the component that now handles all logic

const EmployeeDashboard = ({ currentView }) => {
    const { user, loading } = useAuth(); // We need to check the loading state here

    // Display a loading overlay while the user data is being fetched
    if (loading || !user) {
        return <LoadingOverlay visible={true} />;
    }

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
        <Container fluid>
            {renderContent()}
        </Container>
    );
};

export default EmployeeDashboard;