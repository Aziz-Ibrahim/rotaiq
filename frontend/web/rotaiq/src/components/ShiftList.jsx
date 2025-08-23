import React from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import { List, ThemeIcon, Text, Button, Group } from '@mantine/core';
import { IconCircleCheck, IconCircleDashed, IconCircleFilled } from '@tabler/icons-react';

const ShiftList = ({ shifts, onUpdate }) => {
    const { user, loading } = useAuth();

    const handleAction = async (shiftId, endpoint) => {
        try {
            await apiClient.post(`api/shifts/${shiftId}/${endpoint}/`);
            onUpdate();
        } catch (error) {
            console.error(`Error with ${endpoint} action:`, error);
        }
    };

    if (loading) {
        return <Text>Loading shifts...</Text>;
    }

    if (!user) {
        return <Text color="red">You are not authorized to view this page.</Text>;
    }

    if (!shifts || shifts.length === 0) {
        return <Text>No shifts to display.</Text>;
    }

    return (
        <List
            spacing="md"
            size="sm"
            center
        >
            {shifts.map(shift => {
                if (!shift) {
                    return null;
                }

                const isEmployee = user.role === 'employee';
                const isManager = user.role === 'manager';

                return (
                    <List.Item
                        key={shift.id}
                        icon={
                            <ThemeIcon color={shift.status === 'open' ? 'blue' : shift.status === 'claimed' ? 'orange' : 'green'} size={24} radius="xl">
                                {shift.status === 'open' ? <IconCircleDashed size="1rem" /> : shift.status === 'claimed' ? <IconCircleFilled size="1rem" /> : <IconCircleCheck size="1rem" />}
                            </ThemeIcon>
                        }
                    >
                        <Text component="p"><strong>Role:</strong> {shift.role}</Text>
                        <Text component="p"><strong>Time:</strong> {new Date(shift.start_time).toLocaleString()} - {new Date(shift.end_time).toLocaleString()}</Text>
                        <Text component="p"><strong>Status:</strong> {shift.status}</Text>
                        <Text component="p"><strong>Description:</strong> {shift.description}</Text>
                        
                        {shift.claimed_by_details && (
                            <Text component="p"><strong>Claimed by:</strong> {shift.claimed_by_details.first_name} {shift.claimed_by_details.last_name}</Text>
                        )}
                        
                        <Group mt="md">
                            {isEmployee && shift.status === 'open' && (
                                <Button onClick={() => handleAction(shift.id, 'claim')}>Claim Shift</Button>
                            )}
                            
                            {isManager && shift.status === 'claimed' && (
                                <>
                                    <Button onClick={() => handleAction(shift.id, 'approve')} color="green">Approve</Button>
                                    <Button onClick={() => handleAction(shift.id, 'decline')} color="red">Decline</Button>
                                </>
                            )}
                        </Group>
                    </List.Item>
                );
            })}
        </List>
    );
};

export default ShiftList;