import React from 'react';
import { Title, Text, Accordion, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { isSameDay, isToday } from 'date-fns';

import { useAuth } from '../hooks/useAuth.jsx';
import apiClient from '../api/apiClient.js';
import ShiftCard from './ShiftCard.jsx';

const ShiftList = ({ viewType, onUpdate, shifts: propShifts, staffList: propStaffList }) => { 
    const { user } = useAuth();
    const shifts = propShifts || [];
    const staffList = propStaffList || [];

    const handleClaim = async (shiftId) => {
        try {
            const response = await apiClient.post(`/api/shifts/${shiftId}/claim/`);
            notifications.show({
                title: 'Success!',
                message: response.data.status,
                color: 'green',
            });
            // Call the appropriate update function
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

    // Filter shifts based on viewType and user's branch
    const filteredShifts = shifts.filter(shift => {
        // Ensure user and relevant data exist for comparison
        if (!user || !user.branch?.region) {
            return false;
        }

        // CORRECTED BASE FILTER
        if (shift.branch_details?.region?.id !== user.branch.region.id) {
            return false;
        }

        switch (viewType) {
            case 'open_shifts':
                if (user.role === 'floating_employee') {
                    return shift.status === 'open';
                }
                return shift.status === 'open' && shift.branch_details?.id === user.branch.id;
            case 'pending_claims':
                // Show shifts with at least one pending claim
                return (shift.claims || []).some(claim => claim.status === 'pending');
            case 'my_posted_shifts':
                // Show shifts the current user has posted
                return shift.posted_by_details?.id === user.id;
            case 'my_claims':
                // Show shifts the current user has claimed
                return (shift.claims || []).some(claim => claim.user?.id === user.id);
            case 'all_shifts':
                // Managers see all shifts in their region, so no additional filtering is needed.
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
