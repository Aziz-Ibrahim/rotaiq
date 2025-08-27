import React from 'react';
import { useUserList } from '../hooks/useUserList.jsx';
import { useShiftList } from '../hooks/useShiftList.jsx';
import { useAnalytics } from '../hooks/useAnalytics.jsx';
import { useAuth } from '../hooks/useAuth.jsx'; // Corrected: Import useAuth
import { Container, Title, Text, Paper, List, Grid, Accordion } from '@mantine/core';

// Import the new components
import ShiftList from './ShiftList.jsx';
import ShiftPostForm from './ShiftPostForm.jsx';
import ReportsDashboard from './ReportsDashboard.jsx';

const UserList = ({ users, title }) => (
    <Paper withBorder shadow="md" p="md" mt="lg">
        <Title order={3}>{title}</Title>
        <List mt="sm">
            {users.map((u) => (
                <List.Item key={u.id}>
                    {u.first_name} {u.last_name} ({u.role})
                </List.Item>
            ))}
        </List>
    </Paper>
);

const ManagerDashboard = () => {
    // Corrected: Add useAuth hook
    const { user, loading: authLoading, error: authError } = useAuth();
    const { userList, loading: userLoading, error: userError } = useUserList();
    const { shifts, loading: shiftsLoading, error: shiftsError, fetchShifts } = useShiftList();

    // The useAnalytics hook depends on the 'user' object from useAuth
    // We pass the user's branch ID to get the correct analytics
    // Make sure we have the user object before calling this hook.
    const { data: openShiftsData, loading: analyticsLoading, error: analyticsError } = user?.branch?.id
        ? useAnalytics('open_shifts_by_branch', { branch_id: user.branch.id })
        : { data: [], loading: false, error: null };

    // Update loading and error checks to include all hooks
    if (authLoading || userLoading || shiftsLoading || analyticsLoading) return <Text>Loading dashboard data...</Text>;
    if (authError || userError || shiftsError || analyticsError) return <Text color="red">Error: Failed to load data.</Text>;

    return (
        <Container>
            <Title order={2}>Manager Dashboard</Title>
            <Text>Manage your branch's team, schedule, and operations here. You can assign shifts and invite new employees.</Text>
            
            <Accordion defaultValue="shift-list" mt="lg">
                <Accordion.Item value="post-shift">
                    <Accordion.Control>Post a New Shift</Accordion.Control>
                    <Accordion.Panel>
                        <ShiftPostForm onUpdate={fetchShifts} />
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="shift-list">
                    <Accordion.Control>All Shifts</Accordion.Control>
                    <Accordion.Panel>
                        <ShiftList shifts={shifts} onUpdate={fetchShifts} />
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="reports">
                    <Accordion.Control>Open Shifts Analytics</Accordion.Control>
                    <Accordion.Panel>
                        <ReportsDashboard data={openShiftsData} loading={analyticsLoading} error={analyticsError} />
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Container>
    );
};

export default ManagerDashboard;
