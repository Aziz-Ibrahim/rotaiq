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
    
    // Explicitly check all loading states
    const isLoading = authLoading || shiftsLoading || userLoading;
    const isError = authError || shiftsError || userError;

    console.log('Dashboard Render Cycle:');
    console.log('User State:', user);
    console.log('Shifts State:', shifts);
    console.log('Loading State (Auth, Shifts, Users):', authLoading, shiftsLoading, userLoading);

    useEffect(() => {
        // Fetch shifts and users only if the user object is available
        if (user) {
            fetchShifts();
            fetchUsers();
        }
    }, [user, fetchShifts, fetchUsers]);

    console.log('Checking for full data availability...');
    console.log('Is User fully loaded?', user && user.branch?.region);
    console.log('Are Shifts available?', shifts && shifts.length > 0);
    if (isLoading || !user || !user.branch?.region) {
        return <LoadingOverlay visible={true} />;
    }
    
    if (isError) {
        return <Text color="red">Error: Failed to load data.</Text>;
    }
    
    // Normalize the user's region ID for filtering
    const userRegionId = user.branch.region.id;
    console.log('User Region ID:', userRegionId);

    // Filter shifts and user list in the parent component
    console.log('Filtering open shifts...');
    const filteredOpenShifts = shifts.filter(shift => {
        // Log each shift being evaluated
        console.log('Evaluating Shift ID:', shift.id);
        console.log('  Shift Region ID:', shift.branch_details?.region?.id);
        console.log('  Shift Status:', shift.status);
        console.log('  Does region match?', shift.branch_details?.region?.id === userRegionId);
        console.log('  Is status "open"?', shift.status === 'open');

        // Return the boolean result of the combined conditions
        return shift.branch_details?.region?.id === userRegionId && shift.status === 'open';
    });
    
    console.log('Filtering my claims...');
    const filteredMyClaims = shifts.filter(shift => {
        console.log('Evaluating Shift ID:', shift.id);
        console.log('  Shift Region ID:', shift.branch_details?.region?.id);
        console.log('  Claimed by User?', (shift.claims || []).some(claim => claim.user?.id === user.id));
        
        return shift.branch_details?.region?.id === userRegionId && (shift.claims || []).some(claim => claim.user?.id === user.id);
    });
    console.log('Final Filtered My Claims:', filteredMyClaims);

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