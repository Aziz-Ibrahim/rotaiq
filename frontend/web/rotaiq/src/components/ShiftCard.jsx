import React, { useState } from 'react';
import {
    Accordion,
    Stack,
    Text,
    Badge,
    Button,
    Group
} from '@mantine/core';
import { IconClock, IconMapPin, IconUser, IconCalendar } from '@tabler/icons-react';
import apiClient from '../api/apiClient.js';

const ShiftCard = ({ shift, user, onUpdate, onClaim }) => {
    const [approving, setApproving] = useState(false);
    const [declining, setDeclining] = useState(false);

    const handleApprove = async (claimId) => {
        setApproving(true);
        try {
            await apiClient.post(`/api/claims/${claimId}/approve/`);
            alert("Shift claim approved.");
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error approving claim:', error.response?.data || error.message);
            alert(error.response?.data?.error || 'Failed to approve claim.');
        } finally {
            setApproving(false);
        }
    };

    const handleDecline = async (claimId) => {
        setDeclining(true);
        try {
            await apiClient.post(`/api/claims/${claimId}/decline/`);
            alert("Shift claim declined.");
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error declining claim:', error.response?.data || error.message);
            alert(error.response?.data?.error || 'Failed to decline claim.');
        } finally {
            setDeclining(false);
        }
    };

    const renderActionButtons = () => {
        if (user.role === 'branch_manager' || user.role === 'region_manager') {
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
                        <Text fz="sm">{new Date(shift.start_time).toLocaleString()} to {new Date(shift.end_time).toLocaleString()}</Text>
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

                    {/* Claim/Approval/Decline Buttons */}
                    {['employee', 'floating_employee'].includes(user.role) && shift.status === 'open' && !hasClaim && (
                        <Button onClick={() => onClaim(shift.id)} size="sm">
                            Claim Shift
                        </Button>
                    )}
                    {['employee', 'floating_employee'].includes(user.role) && isPendingClaim && (
                        <Text c="orange" fz="sm" fw={500}>
                            Pending manager approval
                        </Text>
                    )}
                    {renderActionButtons()}
                </Stack>
            </Accordion.Panel>
        </Accordion.Item>
    );
};

export default ShiftCard;
