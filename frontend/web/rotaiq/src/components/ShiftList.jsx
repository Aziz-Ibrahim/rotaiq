import React, { useState, useEffect } from 'react';
import { Title, Text, Accordion, Stack, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../hooks/useAuth.jsx';
import apiClient from '../api/apiClient.js';
import ShiftCard from './ShiftCard.jsx';
import { useShiftList } from '../hooks/useShiftList.jsx';
import { useUserList } from '../hooks/useUserList.jsx';

const ShiftList = ({ viewType }) => { 
    const { user, loading: authLoading } = useAuth();
    const { shifts, loading: shiftsLoading, error: shiftsError, fetchShifts } = useShiftList();
    const { userList, loading: userLoading, error: userError, fetchUsers } = useUserList();

    const isLoading = authLoading || shiftsLoading || userLoading;
    const isError = shiftsError || userError;

    useEffect(() => {
        // Fetch data only after the user object is available
        if (user) {
            fetchShifts();
            fetchUsers();
        }
    }, [user, fetchShifts, fetchUsers]);

    if (isLoading) {
        return <LoadingOverlay visible={true} />;
    }

    if (isError) {
        return <Text color="red">Error: Failed to load data.</Text>;
    }
    
    // Explicitly check for full data before filtering
    if (!user || !user.branch?.region || !shifts || !userList) {
        return <LoadingOverlay visible={true} />;
    }

    const userRegionId = Number(user.branch.region.id);

    const filteredShifts = shifts.filter(shift => {
        const shiftRegionId = Number(shift.branch_details?.region?.id);
        
        // This is the core logic. Ensure the regions match.
        if (shiftRegionId !== userRegionId) {
            return false;
        }

        switch (viewType) {
            case 'open_shifts':
                return shift.status === 'open';
            case 'my_claims':
                return (shift.claims || []).some(claim => claim.user?.id === user.id);
            // Include other view types as needed
            default:
                return false;
        }
    });

    const shiftItems = filteredShifts.map((shift) => (
        <ShiftCard 
            key={shift.id} 
            shift={shift} 
            user={user} 
            onUpdate={fetchShifts} 
            staffList={userList}
        />
    ));

    return (
        <Stack mt="md">
            {shiftItems.length > 0 ? (
                <Accordion defaultValue={String(shiftItems[0].key)}>
                    {shiftItems}
                </Accordion>
            ) : (
                <Text color="dimmed">No shifts to display for this view.</Text>
            )}
        </Stack>
    );
};

export default ShiftList;