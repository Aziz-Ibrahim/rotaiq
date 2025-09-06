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

    // Early return if essential data is missing.
    // This check is the first line of defense against runtime errors.
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

    // Use a variable to store the user's region ID for clarity and consistency.
    // Use `Number()` to ensure the data type is consistent.
    const userRegionId = Number(user.branch.region.id);

    const filteredShifts = shifts.filter(shift => {
        if (!user) {
            return false;
        }

        // Get region IDs - handle both user structures
        const userRegionId = user.branch?.region?.id || user.region;
        const shiftRegionId = shift.branch_details?.region?.id;
        
        // Check region match
        if (!userRegionId || !shiftRegionId || userRegionId !== shiftRegionId) {
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
                <Accordion defaultValue={shiftItems[0].key}>
                    {shiftItems}
                </Accordion>
            ) : (
                <Text color="dimmed">No shifts to display for this view.</Text>
            )}
        </Stack>
    );
};

export default ShiftList;