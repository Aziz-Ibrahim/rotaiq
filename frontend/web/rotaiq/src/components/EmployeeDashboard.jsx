import React from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Container, Title, Text, Accordion, Stack } from '@mantine/core';
import ShiftList from './ShiftList.jsx';

const EmployeeDashboard = () => {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) {
        return <Text>Loading user data...</Text>;
    }

    if (!user || user.role === 'branch_manager' || user.role === 'region_manager' || user.role === 'head_office') {
        return <Text color="red">You do not have permission to view this page.</Text>;
    }

    return (
        <Container>
            <Title order={2}>Employee Dashboard</Title>
            <Text>Welcome back, {user.first_name}! Here are the available shifts.</Text>
            
            <Accordion defaultValue="open-shifts" mt="lg">
                <Accordion.Item value="open-shifts">
                    <Accordion.Control>Available Open Shifts</Accordion.Control>
                    <Accordion.Panel>
                        <ShiftList viewType="open_shifts" />
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="my-claims">
                    <Accordion.Control>My Claims</Accordion.Control>
                    <Accordion.Panel>
                        <ShiftList viewType="my_claims" />
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Container>
    );
};

export default EmployeeDashboard;