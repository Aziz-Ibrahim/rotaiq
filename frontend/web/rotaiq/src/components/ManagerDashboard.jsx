import React from 'react';
import { useUserList } from '../hooks/useUserList.jsx';
import { useShiftList } from '../hooks/useShiftList.jsx';
import { Container, Title, Text, Paper, List, Grid } from '@mantine/core';

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
    const { userList, loading: userLoading, error: userError } = useUserList();
    const { shifts, loading: shiftsLoading, error: shiftsError, fetchShifts } = useShiftList();

    if (userLoading || shiftsLoading) return <Text>Loading dashboard data...</Text>;
    if (userError || shiftsError) return <Text color="red">Error: Failed to load data.</Text>;

    return (
        <Container>
            <Title order={2}>Manager Dashboard</Title>
            <Text>Manage your branch's team, schedule, and operations here. You can assign shifts and invite new employees.</Text>
            
            <Grid gutter="xl" mt="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper shadow="md" p="md" withBorder>
                        <ShiftPostForm onUpdate={fetchShifts} />
                    </Paper>
                    {/* Display the user list */}
                    <UserList users={userList} title="Your Branch Team" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <ReportsDashboard />
                    <Paper shadow="md" p="md" withBorder>
                        <Title order={2} mb="md">All Shifts</Title>
                        <ShiftList shifts={shifts} onUpdate={fetchShifts} />
                    </Paper>
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export default ManagerDashboard;
