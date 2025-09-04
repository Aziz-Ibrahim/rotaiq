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

    // Filter shifts based on viewType and user's branch
    const filteredShifts = shifts.filter(shift => {
        if (!user || !user.branch?.region) {
            return false;
        }

        // Apply a base filter to ensure shifts belong to the user's region
        // This is a crucial check for all user types
        if (shift.branch_details?.region?.id !== user.branch.region.id) {
            return false;
        }

        switch (viewType) {
            case 'open_shifts':
                // Both regular and floating employees can see all open shifts in their region
                return shift.status === 'open';
            case 'pending_claims':
                // For managers: show shifts with at least one pending claim
                return (shift.claims || []).some(claim => claim.status === 'pending');
            case 'my_posted_shifts':
                // For managers: show shifts the current manager has posted
                return shift.posted_by_details?.id === user.id;
            case 'my_claims':
                // For employees: show shifts the current employee has claimed
                return (shift.claims || []).some(claim => claim.user?.id === user.id);
            case 'all_shifts':
                // For managers: see all shifts in their region. Base filter handles this.
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
