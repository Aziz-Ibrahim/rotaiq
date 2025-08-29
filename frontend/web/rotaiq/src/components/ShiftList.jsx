import React, { useEffect, useState } from 'react';
import { useShiftList } from '../hooks/useShiftList.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { Title, Text, Button, Accordion, Badge, Stack } from '@mantine/core';
import ShiftCard from './ShiftCard.jsx';
import apiClient from '../api/apiClient.js';

const ShiftList = ({ viewType, onUpdate }) => {
    const { user } = useAuth();
    const { shifts, loading, error, fetchShifts } = useShiftList();
    const [claiming, setClaiming] = useState(false);

    useEffect(() => {
        fetchShifts();
        const intervalId = setInterval(fetchShifts, 30000000);
        return () => clearInterval(intervalId);
    }, [fetchShifts]);

    if (loading) {
        return <Text>Loading shifts...</Text>;
    }

    if (error) {
        return <Text color="red">Error: Failed to load shifts.</Text>;
    }

    const handleClaim = async (shiftId) => {
        if (claiming) return;
        setClaiming(true);
        try {
            await apiClient.post(`/api/shifts/${shiftId}/claim/`);
            alert("Shift claimed successfully. It's now pending manager approval.");
            await fetchShifts();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error claiming shift:', error.response?.data || error.message);
            alert(error.response?.data?.error || 'Failed to claim shift.');
        } finally {
            setClaiming(false);
        }
    };
    
    const filteredShifts = shifts.filter(shift => {
        if (!user || !user.role) return false;

        switch (viewType) {
            case 'open_shifts':
                if (user.role === 'employee' || user.role === 'floating_employee') {
                    return shift.status === 'open';
                }
                return false;
            case 'pending_claims':
                return shift.claims.some(claim => claim.status === 'pending');
            case 'my_posted_shifts':
                return shift.posted_by === user.id;
            case 'my_claims':
                return shift.claims.some(claim => claim.user?.id === user.id);
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
            onUpdate={fetchShifts} 
            onClaim={handleClaim} 
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
