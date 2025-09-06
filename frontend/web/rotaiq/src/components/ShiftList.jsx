import React from 'react';
import { Title, Text, Accordion, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useAuth } from '../hooks/useAuth.jsx';
import apiClient from '../api/apiClient.js';
import ShiftCard from './ShiftCard.jsx';

const ShiftList = ({ viewType, onUpdate, shifts: propShifts, staffList: propStaffList }) => { 
    const { user } = useAuth();
    const shifts = propShifts || [];
    const staffList = propStaffList || [];

    // Log the incoming props
    console.log('ShiftList Props:');
    console.log('View Type:', viewType);
    console.log('Total Shifts Received:', shifts);
    console.log('Number of Shifts Received:', shifts.length);

    // Early return if essential user data is missing
    if (!user || !user.branch || !user.branch.region) {
        return <Text color="dimmed">Loading user data...</Text>;
    }

    const handleClaim = async (shiftId) => {
        try {
            const response = await apiClient.post(`/api/shifts/${shiftId}/claim/`);
            notifications.show({
                title: 'Success!',
                message: response.data.status,
                color: 'green',
            });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error claiming shift:', error.response?.data || error.message);
            notifications.show({
                title: 'Error!',
                message: error.response?.data?.error || 'Failed to claim shift.',
                color: 'red',
            });
        }
    };

    const userRegionId = Number(user.branch.region.id);

    // This is the filtering logic. The result is stored in `filteredShifts`.
    const filteredShifts = shifts.filter(shift => {
        const shiftRegionId = Number(shift.branch_details?.region?.id);

        // Extensive logging for each shift's filter evaluation
        console.groupCollapsed(`Filtering Shift ID: ${shift.id}`);
        console.log('User Region ID:', userRegionId);
        console.log('Shift Region ID:', shiftRegionId);
        console.log('Region IDs match:', shiftRegionId === userRegionId);
        console.log('Shift Status:', shift.status);
        console.log('View Type:', viewType);
        console.groupEnd();
        
        // This is the core logic. `true` is returned only if both conditions are met.
        if (shiftRegionId !== userRegionId) {
            return false;
        }

        switch (viewType) {
            case 'open_shifts':
                return shift.status === 'open';
            case 'pending_claims':
                return (shift.claims || []).some(claim => claim.status === 'pending');
            case 'my_posted_shifts':
                return shift.posted_by_details?.id === user.id;
            case 'my_claims':
                return (shift.claims || []).some(claim => claim.user?.id === user.id);
            case 'all_shifts':
                return true; 
            default:
                return false;
        }
    });

    // Log the result of the filtering process
    console.log('Filtered Shifts Result:', filteredShifts);
    console.log('Number of Filtered Shifts:', filteredShifts.length);

    const shiftItems = filteredShifts.map((shift) => (
        <ShiftCard 
            key={shift.id} 
            shift={shift} 
            user={user} 
            onUpdate={onUpdate} 
            onClaim={handleClaim} 
            staffList={staffList}
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