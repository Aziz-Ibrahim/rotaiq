import React from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useShiftList } from '../hooks/useShiftList.jsx';
import { Container, Title, Text, Accordion, Grid, Badge, Paper, List } from '@mantine/core';

// Re-using the ShiftList component from before
const ShiftList = ({ shifts, onUpdate }) => {
    return (
        <Paper withBorder shadow="md" p="md" mt="lg">
            <Title order={3}>Available Shifts</Title>
            <List mt="sm">
                {shifts.length > 0 ? (
                    shifts.map((shift) => (
                        <List.Item key={shift.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text fw={500}>Role: {shift.role}</Text>
                                    <Text size="sm">
                                        Time: {shift.start_time} - {shift.end_time}
                                    </Text>
                                </div>
                                <Badge color={shift.status === 'open' ? 'green' : 'gray'}>
                                    {shift.status}
                                </Badge>
                            </div>
                        </List.Item>
                    ))
                ) : (
                    <Text>No shifts found.</Text>
                )}
            </List>
        </Paper>
    );
};

// Main App component to handle routing
const App = () => {
    const { user, loading: authLoading, error: authError } = useAuth();
    const { shifts, loading: shiftsLoading, error: shiftsError, fetchShifts } = useShiftList();

    if (authLoading || shiftsLoading) {
        return <Text>Loading dashboard...</Text>;
    }
    if (authError || shiftsError) {
        return <Text color="red">Error: Failed to load dashboard data.</Text>;
    }

    if (user.role === 'employee') {
        const myShifts = shifts.filter(shift => shift.employee_id === user.id);
        const openShiftsInBranch = shifts.filter(shift => shift.status === 'open' && shift.branch_id === user.branch_id);

        return (
            <Container>
                <Title order={2}>Employee Dashboard</Title>
                <Text>Welcome, {user.first_name}! Here are your shifts and open shifts you can apply for at your branch.</Text>
                
                <Grid gutter="xl" mt="lg">
                    <Grid.Col span={12}>
                        <Accordion defaultValue="my-shifts">
                            <Accordion.Item value="my-shifts">
                                <Accordion.Control>My Shifts</Accordion.Control>
                                <Accordion.Panel>
                                    <ShiftList shifts={myShifts} onUpdate={fetchShifts} />
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="open-shifts">
                                <Accordion.Control>Available Shifts in My Branch</Accordion.Control>
                                <Accordion.Panel>
                                    <ShiftList shifts={openShiftsInBranch} onUpdate={fetchShifts} />
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    </Grid.Col>
                </Grid>
            </Container>
        );
    }

    if (user.role === 'floating_employee') {
        const myShifts = shifts.filter(shift => shift.employee_id === user.id);
        const openShiftsInRegion = shifts.filter(shift => shift.status === 'open' && shift.region_id === user.region_id);

        return (
            <Container>
                <Title order={2}>Floating Employee Dashboard</Title>
                <Text>Welcome, {user.first_name}! Manage your shifts and apply for open shifts in your region below.</Text>
                
                <Grid gutter="xl" mt="lg">
                    <Grid.Col span={12}>
                        <Accordion defaultValue="my-shifts">
                            <Accordion.Item value="my-shifts">
                                <Accordion.Control>My Shifts</Accordion.Control>
                                <Accordion.Panel>
                                    <ShiftList shifts={myShifts} onUpdate={fetchShifts} />
                                </Accordion.Panel>
                            </Accordion.Item>
                            <Accordion.Item value="open-shifts">
                                <Accordion.Control>All Open Shifts in My Region</Accordion.Control>
                                <Accordion.Panel>
                                    <ShiftList shifts={openShiftsInRegion} onUpdate={fetchShifts} />
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    </Grid.Col>
                </Grid>
            </Container>
        );
    }
    
    // Fallback for other roles (e.g., manager, etc.)
    return <Text>No dashboard available for this user role.</Text>;
};

export default App;
