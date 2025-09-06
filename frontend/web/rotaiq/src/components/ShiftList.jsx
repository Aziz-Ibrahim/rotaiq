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

    // Early return if essential data is missing
    if (!user) {
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

    const filteredShifts = shifts.filter(shift => {
        // Convert both IDs to numbers for safe comparison
        const userRegionId = Number(user.branch.region.id); // We know this exists
        const shiftRegionId = Number(shift.branch_details?.region?.id);
        
        console.log(`DEBUG: User region: ${userRegionId}, Shift region: ${shiftRegionId}`);
        
        // Check region match - single comprehensive check
        if (!userRegionId || !shiftRegionId || userRegionId !== shiftRegionId) {
            console.log(`DEBUG: Filtering out shift ${shift.id} - region mismatch`);
            return false;
        }

        // Now apply the view-specific filters
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

    console.log('DEBUG: Filtered shifts count:', filteredShifts.length);
    console.log('DEBUG: Filtered shifts:', filteredShifts);

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
                <Accordion defaultValue={shiftItems[0]?.key}>
                    {shiftItems}
                </Accordion>
            ) : (
                <Text color="dimmed">No shifts to display for this view.</Text>
            )}
        </Stack>
    );
};

export default ShiftList;