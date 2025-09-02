import React, { useState } from 'react';
import {
    Accordion,
    Stack,
    Text,
    Badge,
    Button,
    Group,
    Divider,
    Card
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconClock, IconMapPin, IconUser, IconCalendar } from '@tabler/icons-react';
import { format } from 'date-fns';
import apiClient from '../api/apiClient.js';
import AssignStaffModal from './AssignStaffModal.jsx';
import ClaimList from './ClaimList.jsx'; // Make sure you have this component

const ShiftCard = ({ shift, user, onUpdate, staffList }) => {
    const [approving, setApproving] = useState(false);
    const [declining, setDeclining] = useState(false);
    const [modalOpened, setModalOpened] = useState(false);

    // Helper to determine if the user is a manager
    const isManager = user.role === 'branch_manager' || user.role === 'region_manager';

    const handleApprove = async (claimId) => {
        setApproving(true);
        try {
            await apiClient.post(`/api/claims/${claimId}/approve/`);
            notifications.show({
                title: 'Success',
                message: 'Shift claim approved.',
                color: 'green',
            });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error approving claim:', error.response?.data || error.message);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.error || 'Failed to approve claim.',
                color: 'red',
            });
        } finally {
            setApproving(false);
        }
    };

    const handleDecline = async (claimId) => {
        setDeclining(true);
        try {
            await apiClient.post(`/api/claims/${claimId}/decline/`);
            notifications.show({
                title: 'Success',
                message: 'Shift claim declined.',
                color: 'red',
            });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error declining claim:', error.response?.data || error.message);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.error || 'Failed to decline claim.',
                color: 'red',
            });
        } finally {
            setDeclining(false);
        }
    };

    const handleClaim = async (shiftId) => {
        try {
            await apiClient.post(`/api/shifts/${shiftId}/claim/`);
            notifications.show({
                title: 'Success',
                message: "Shift claimed successfully. It's now pending manager approval.",
                color: 'green',
            });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error claiming shift:', error.response?.data || error.message);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.error || 'Failed to claim shift.',
                color: 'red',
            });
        }
    };

    const renderActionButtons = () => {
        if (isManager) {
            const pendingClaims = shift.claims.filter(claim => claim.status === 'pending');
            if (pendingClaims.length > 0) {
                return (
                    <Group mt="md">
                        <Button
                            onClick={() => handleApprove(pendingClaims[0].id)}
                            loading={approving}
                            disabled={declining}
                            variant="filled"
                            color="teal"
                        >
                            Approve
                        </Button>
                        <Button
                            onClick={() => handleDecline(pendingClaims[0].id)}
                            loading={declining}
                            disabled={approving}
                            variant="outline"
                            color="red"
                        >
                            Decline
                        </Button>
                    </Group>
                );
            }
        }
        return null;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open':
                return <Badge color="green">Open</Badge>;
            case 'claimed':
                return <Badge color="orange">Claimed</Badge>;
            case 'approved':
                return <Badge color="blue">Approved</Badge>;
            case 'declined':
                return <Badge color="red">Declined</Badge>;
            default:
                return <Badge>Unknown</Badge>;
        }
    };

    // Check if the current user has a pending claim on this shift
    const isPendingClaim = shift.claims.some(claim => claim.user?.id === user.id && claim.status === 'pending');
    const hasClaim = shift.claims.some(claim => claim.user?.id === user.id);

    return (
        <Accordion.Item value={String(shift.id)}>
            <Accordion.Control>
                <Group position="apart">
                    <Text fw={500}>{shift.role} Shift</Text>
                    {getStatusBadge(shift.status)}
                </Group>
            </Accordion.Control>
            <Accordion.Panel>
                <Stack>
                    <Group spacing="xs">
                        <IconCalendar size={16} />
                        <Text fz="sm">{format(new Date(shift.start_time), 'PPp')} to {format(new Date(shift.end_time), 'p')}</Text>
                    </Group>
                    <Group spacing="xs">
                        <IconMapPin size={16} />
                        <Text fz="sm">
                            {shift.branch_details?.name || 'N/A'}
                        </Text>
                    </Group>
                    <Group spacing="xs">
                        <IconUser size={16} />
                        <Text fz="sm">Posted by: {shift.posted_by_details?.first_name} {shift.posted_by_details?.last_name}</Text>
                    </Group>
                    {shift.assigned_to_details && (
                        <Group spacing="xs">
                            <IconUser size={16} />
                            <Text fz="sm">Assigned to: {shift.assigned_to_details.first_name} {shift.assigned_to_details.last_name}</Text>
                        </Group>
                    )}
                    {shift.description && (
                        <Text fz="sm" c="dimmed">
                            {shift.description}
                        </Text>
                    )}

                    <Divider my="sm" />

                    {/* Employee and floating employee actions */}
                    {['employee', 'floating_employee'].includes(user.role) && shift.status === 'open' && !hasClaim && (
                        <Button onClick={() => handleClaim(shift.id)} size="sm">
                            Claim Shift
                        </Button>
                    )}
                    {['employee', 'floating_employee'].includes(user.role) && isPendingClaim && (
                        <Text c="orange" fz="sm" fw={500}>
                            Pending manager approval
                        </Text>
                    )}

                    {/* Manager actions */}
                    {isManager && shift.claims && shift.claims.length > 0 && (
                        <ClaimList claims={shift.claims} onUpdate={onUpdate} />
                    )}
                    {isManager && shift.status === 'open' && (
                        <Button onClick={() => setModalOpened(true)} size="sm" variant="outline">
                            Assign Staff
                        </Button>
                    )}
                    {renderActionButtons()}
                </Stack>
            </Accordion.Panel>

            <AssignStaffModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                shift={shift}
                staffList={staffList}
                onAssignSuccess={onUpdate} // Re-fetch shifts on success
            />
        </Accordion.Item>
    );
};

export default ShiftCard;