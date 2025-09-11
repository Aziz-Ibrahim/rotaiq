import React from 'react';
import { Modal, Select, Button, Group, Text, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import apiClient from '../api/apiClient';
import { notifications } from '@mantine/notifications';

const AssignStaffModal = ({ opened, onClose, shift, staffList, onAssignSuccess }) => {
    const form = useForm({
        initialValues: {
            staff_id: null,
        },
        validate: {
            staff_id: (value) => (value ? null : 'Please select a staff member'),
        },
    });

    const handleSubmit = async (values) => {
        try {
            await apiClient.post(`/api/shifts/${shift.id}/assign_staff/`, {
                staff_id: parseInt(values.staff_id, 10),
            });
            notifications.show({
                title: 'Shift Assigned!',
                message: `Shift was successfully assigned to the selected staff member.`,
                color: 'green',
            });
            onClose();
            if (onAssignSuccess) {
                onAssignSuccess();
            }
        } catch (err) {
            console.error('Error assigning shift:', err.response?.data || err.message);
            notifications.show({
                title: 'Assignment Failed',
                message: err.response?.data?.error || 'Failed to assign shift.',
                color: 'red',
            });
        }
    };

    const formattedStaffList = (staffList || [])
        .filter(staff => staff.role === 'employee' || staff.role === 'floating_employee')
        .map(staff => ({
            value: staff.id.toString(),
            label: `${staff.first_name} ${staff.last_name} (${staff.branch.name})`,
        }));

    return (
        <Modal 
            opened={opened} 
            onClose={onClose} 
            title="Assign Staff to Shift"
            styles={{
                root: { position: 'fixed' },
                inner: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '1rem' }
            }}
        >
            <Text size="sm" mb="md">
                Select a staff member to directly assign them to this shift without a claim.
            </Text>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <Select
                        label="Staff Member"
                        placeholder="Select a staff member"
                        data={formattedStaffList}
                        searchable
                        {...form.getInputProps('staff_id')}
                    />
                    <Group position="right" mt="md">
                        <Button variant="default" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Assign Shift
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
};

export default AssignStaffModal;