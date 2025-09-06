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
    
    const isLoading = authLoading || shiftsLoading || userLoading;
    const isError = authError || shiftsError || userError;

    // This useEffect is where the fix lies.
    useEffect(() => {
        // Fetch shifts and users only if the user object is available
        if (user) {
            fetchShifts();
            fetchUsers();
        }
    }, [user, fetchShifts, fetchUsers]);

    // This is the CRUCIAL part. The component now waits until the shifts data is also present.
    // The previous code had a potential issue where the shifts were not fully loaded yet.
    if (isLoading || !user || !user.branch?.region || !shifts) {
        return <LoadingOverlay visible={true} />;
    }
    
    if (isError) {
        return <Text color="red">Error: Failed to load data.</Text>;
    }
    
    const userRegionId = user.branch.region.id;

    const filteredOpenShifts = shifts.filter(
        shift =>
            shift.branch_details?.region?.id === userRegionId &&
            shift.status === 'open'
    );
    
    const filteredMyClaims = shifts.filter(
        shift => 
            shift.branch_details?.region?.id === userRegionId &&
            (shift.claims || []).some(claim => claim.user?.id === user.id)
    );

    const renderContent = () => {
        switch (currentView) {
            case 'open-shifts':
                return (
                    <>
                        <Title order={2}>Open Shifts</Title>
                        <Text>View and claim available shifts in your region.</Text>
                        <ShiftList 
                            viewType="open_shifts" 
                            shifts={filteredOpenShifts}
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
                            shifts={filteredMyClaims}
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