import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Container, Title, Text, LoadingOverlay } from '@mantine/core';
import ShiftList from './ShiftList.jsx';
import { useShiftList } from '../hooks/useShiftList.jsx';

const EmployeeDashboard = ({ currentView }) => {
    const { user, loading: authLoading } = useAuth();
    const { shifts, loading: shiftsLoading, error: shiftsError, fetchShifts } = useShiftList();

    // Fetch shifts once on load and every 30 seconds
    useEffect(() => {
        fetchShifts();
        const intervalId = setInterval(fetchShifts, 30000);
        return () => clearInterval(intervalId);
    }, [fetchShifts]);

    if (authLoading || shiftsLoading) {
        return <LoadingOverlay visible={true} />;
    }

    if (shiftsError) {
        return <Text color="red">Error: Failed to load shifts.</Text>;
    }

    // Filter shifts based on the user's branch's region for open shifts
    const userRegionId = user.branch?.region?.id;
    const regionalShifts = shifts.filter(shift => shift.branch?.region?.id === userRegionId);

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return (
                    <>
                        <Title order={2}>Employee Dashboard</Title>
                        <Text>Welcome back, {user.first_name}! Here are the available shifts.</Text>
                        <ShiftList viewType="open_shifts" shifts={regionalShifts} onUpdate={fetchShifts} />
                    </>
                );
            case 'my-claims':
                return (
                    <>
                        <Title order={2}>My Claims</Title>
                        <Text>View all the shifts you have claimed.</Text>
                        <ShiftList viewType="my_claims" shifts={regionalShifts} onUpdate={fetchShifts} />
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