import React, { useState } from 'react';
import { Stack, Text, Badge, Button, Group, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUser } from '@tabler/icons-react';
import apiClient from '../api/apiClient.js';

const ClaimList = ({ claims, onUpdate }) => {
    const [approving, setApproving] = useState(false);
    const [declining, setDeclining] = useState(false);

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

    const validClaims = claims || [];

    return (
        <Stack mt="md">
            <Divider label="Claims" labelPosition="center" />
            {validClaims.length > 0 ? (
                validClaims.map(claim => (
                    <Group key={claim.id} position="apart" spacing="md" noWrap>
                        <Stack spacing={2}>
                            <Group spacing="xs">
                                <IconUser size={16} />
                                <Text fz="sm" fw={500}>
                                    {claim.user?.first_name} {claim.user?.last_name}
                                </Text>
                            </Group>
                            <Badge color={claim.status === 'pending' ? 'yellow' : 'gray'}>
                                {claim.status.toUpperCase()}
                            </Badge>
                        </Stack>
                        {claim.status === 'pending' && (
                            <Group spacing="xs">
                                <Button
                                    size="xs"
                                    onClick={() => handleApprove(claim.id)}
                                    loading={approving}
                                    disabled={declining}
                                    variant="filled"
                                    color="teal"
                                >
                                    Approve
                                </Button>
                                <Button
                                    size="xs"
                                    onClick={() => handleDecline(claim.id)}
                                    loading={declining}
                                    disabled={approving}
                                    variant="outline"
                                    color="red"
                                >
                                    Decline
                                </Button>
                            </Group>
                        )}
                    </Group>
                ))
            ) : (
                <Text fz="sm" c="dimmed">No claims for this shift yet.</Text>
            )}
        </Stack>
    );
};

export default ClaimList;