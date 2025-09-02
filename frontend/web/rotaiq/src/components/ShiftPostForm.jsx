import React from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '@mantine/form';
import { Box, TextInput, Textarea, Button, Title, Text, Stack, Select } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';

// Accept `branches` and `userRole` as props from the parent component.
const ShiftPostForm = ({ onUpdate, branches, userRole }) => {
    const { user } = useAuth();
    
    // Determine if the user is a manager (and should see the dropdown)
    const isManager = userRole === 'branch_manager' || userRole === 'region_manager';

    const form = useForm({
        initialValues: {
            start_time: '',
            end_time: '',
            role: '',
            description: '',
            // Add a branch field to the form's state.
            // Default to the user's branch ID if they are not a manager.
            branch: isManager ? '' : (user?.branch?.id?.toString() || ''),
        },
        validate: {
            start_time: (value) => (value && new Date(value) > new Date() ? null : 'Start time cannot be in the past'),
            end_time: (value, values) => {
                if (!value) {
                    return 'End time is required';
                }
                if (new Date(value) <= new Date(values.start_time)) {
                    return 'End time must be after start time';
                }
                return null;
            },
            role: (value) => (value ? null : 'Role is required'),
            description: (value) => (value ? null : 'Description is required'),
            // Only validate the branch field for managers
            branch: (value, values) => (isManager && !value ? 'Branch is required' : null),
        },
    });

    const handleSubmit = async (values) => {
        try {
            // Ensure necessary user data is available
            if (!user?.id) {
                console.error("User ID is missing. Cannot submit shift.");
                return;
            }

            const formattedStartTime = values.start_time ? new Date(values.start_time).toISOString() : null;
            const formattedEndTime = values.end_time ? new Date(values.end_time).toISOString() : null;

            const shiftData = {
                start_time: formattedStartTime,
                end_time: formattedEndTime,
                role: values.role,
                description: values.description,
                // Use the branch ID from the form for managers, otherwise use the user's branch.
                branch: isManager ? parseInt(values.branch, 10) : user.branch.id,
                posted_by: user.id,
            };

            console.log("Submitting shift data:", shiftData);
            await apiClient.post('api/shifts/', shiftData);
            
            form.reset();
            if (onUpdate) {
                onUpdate();
            }
        } catch (err) {
            console.error("Error posting shift:", err.response ? err.response.data : err.message);
        }
    };

    return (
        <Box maw={400} mx="auto" p="md">
            <Title order={3}>Post a New Shift</Title>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    {/* Conditionally render the branch select for managers */}
                    {isManager ? (
                        <Select
                            label="Select Branch"
                            placeholder="Choose a branch"
                            data={branches}
                            {...form.getInputProps('branch')}
                            searchable
                        />
                    ) : (
                        // Display a read-only field for non-managers
                        <TextInput
                            label="Your Branch"
                            value={user?.branch?.name || ''}
                            readOnly
                        />
                    )}
                    <DateTimePicker
                        label="Start Time"
                        placeholder="Pick date and time"
                        {...form.getInputProps('start_time')}
                    />
                    <DateTimePicker
                        label="End Time"
                        placeholder="Pick date and time"
                        {...form.getInputProps('end_time')}
                    />
                    <TextInput
                        label="Role"
                        placeholder="e.g., Cashier"
                        {...form.getInputProps('role')}
                    />
                    <Textarea
                        label="Description"
                        placeholder="Shift description"
                        {...form.getInputProps('description')}
                    />
                    <Button type="submit">Post Shift</Button>
                </Stack>
            </form>
        </Box>
    );
};

export default ShiftPostForm;