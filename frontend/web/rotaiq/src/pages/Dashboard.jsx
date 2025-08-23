import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ManagerDashboard from '../components/ManagerDashboard';
import EmployeeDashboard from '../components/EmployeeDashboard';
import { AppShell, Button, Group, Box, Text } from '@mantine/core';

const Dashboard = () => {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    if (!user) {
        return null;
    }

    return (
        <AppShell
            padding="md"
            header={{ height: 60 }}
        >
            <AppShell.Header>
                <Group h="100%" px="md" position="apart">
                    <Text size="xl" weight={700}>Welcome, {user.first_name}!</Text>
                    <Button onClick={logout}>Logout</Button>
                </Group>
            </AppShell.Header>
            <AppShell.Main>
                <Box p="lg">
                    {user.role === 'manager' && <ManagerDashboard />}
                    {user.role === 'employee' && <EmployeeDashboard />}
                </Box>
            </AppShell.Main>
        </AppShell>
    );
};

export default Dashboard;