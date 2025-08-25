import React from 'react';
import { useShiftList } from '../hooks/useShiftList.jsx';
import { Paper, Title, Text } from '@mantine/core';
import ShiftList from './ShiftList.jsx';

const EmployeeDashboard = () => {
    const { shifts, loading, error, fetchShifts } = useShiftList();

    if (loading) return <Text>Loading shifts...</Text>;
    if (error) return <Text color="red">Error: Failed to load shifts.</Text>;

    return (
        <Paper shadow="md" p="md" withBorder>
            <Title order={2} mb="md">Available Shifts</Title>
            <ShiftList shifts={shifts} onUpdate={fetchShifts} />
        </Paper>
    );
};

export default EmployeeDashboard;
