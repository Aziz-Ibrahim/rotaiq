import React, { useEffect } from 'react';
import { useShiftList } from '../hooks/useShiftList.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { Title, Text, Accordion, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ShiftCard from './ShiftCard.jsx';
import apiClient from '../api/apiClient.js';

// Now accepts shifts and staffList as props, or uses the hook if props are not provided
const ShiftList = ({ viewType, onUpdate, shifts: propShifts, staffList: propStaffList }) => { 
    const { user } = useAuth();
    // Only use the hook if props are not provided
    const { shifts: hookShifts, loading, error, fetchShifts } = useShiftList();
    const shifts = propShifts || hookShifts;
    const staffList = propStaffList || []; // We'll assume ManagerDashboard passes this

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
            else fetchShifts();
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
    const filteredShifts = (shifts || []).filter(shift => {
        if (!user || !user.role || !shift.branch || !shift.branch.region) return false;
        
        // Ensure shifts are for the user's region
        if (shift.branch.region.id !== user.branch?.region?.id) {
            return false;
        }

        switch (viewType) {
            case 'open_shifts':
                // Floating employees can see all open shifts in their region
                if (user.role === 'floating_employee') {
                    return shift.status === 'open' && shift.branch.region.id === user.branch?.region?.id;
                }
                // Regular employees only see open shifts in their branch
                return shift.status === 'open' && shift.branch.id === user.branch?.id;
            case 'pending_claims':
                return (shift.claims || []).some(claim => claim.status === 'pending');
            case 'my_posted_shifts':
                return shift.posted_by === user.id;
            case 'my_claims':
                return (shift.claims || []).some(claim => claim.user?.id === user.id);
            case 'all_shifts':
                // This view is used by managers to see all shifts in their region.
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