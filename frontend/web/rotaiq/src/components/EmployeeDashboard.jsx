import React, { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Text,
    LoadingOverlay,
    Tabs,
} from '@mantine/core';

import ShiftList from '../components/ShiftList.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useShiftList } from '../hooks/useShiftList.jsx';
import { useUserList } from '../hooks/useUserList.jsx';

const EmployeeDashboard = ({ currentView }) => {
    const { user, loading: authLoading, error: authError } = useAuth();
    const { shifts, loading: shiftsLoading, error: shiftsError, fetchShifts } = useShiftList();
    const { userList, loading: userLoading, error: userError, fetchUsers } = useUserList();
    console.log('Shifts for Employee Dashboard:', shifts);

    const isLoading = authLoading || shiftsLoading || userLoading;
    const isError = authError || shiftsError || userError;

    useEffect(() => {
        fetchShifts();
        fetchUsers();
    }, [fetchShifts, fetchUsers]);
    
    if (isLoading) {
        return <LoadingOverlay visible={true} />;
    }
    
    if (isError) {
        return <Text color="red">Error: Failed to load data.</Text>;
    }

    const renderContent = () => {
        switch (currentView) {
            case 'open-shifts':
                return (
                    <>
                        <Title order={2}>Open Shifts</Title>
                        <Text>View and claim available shifts in your region.</Text>
                        <ShiftList 
                            viewType="open_shifts" 
                            shifts={shifts}
                            staffList={userList} 
                            onUpdate={fetchShifts} 
                        />
                    </>
                );
            case 'my-claims':
                return (
                    <>
                        <Title order={2}>My Shifts</Title>
                        <Text>Shifts you have claimed and are awaiting approval.</Text>
                        <ShiftList 
                            viewType="my_claims" 
                            shifts={shifts}
                            staffList={userList} 
                            onUpdate={fetchShifts} 
                        />
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