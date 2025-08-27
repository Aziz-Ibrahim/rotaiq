// src/components/ShiftPostForm.jsx
import React from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '@mantine/form';
import { Box, TextInput, Textarea, Button, Title, Text, Stack } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';

const ShiftPostForm = ({ onUpdate }) => {
    const { user } = useAuth();
    const form = useForm({
        initialValues: {
            start_time: '',
            end_time: '',
            role: '',
            description: '',
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
        },
    });

    const handleSubmit = async (values) => {
        try {
            // Check for both user and user.id
            if (!user || !user.branch?.id || !user.id) {
                console.error("User not authenticated, branch ID, or user ID is missing. Cannot submit shift.");
                return;
            }

            const formattedStartTime = values.start_time ? new Date(values.start_time).toISOString() : null;
            const formattedEndTime = values.end_time ? new Date(values.end_time).toISOString() : null;

            const shiftData = {
                start_time: formattedStartTime,
                end_time: formattedEndTime,
                role: values.role,
                description: values.description,
                branch: user.branch.id,
                // Add the posted_by field
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
                    <TextInput
                        label="Your Branch"
                        value={user?.branch?.name || ''}
                        readOnly
                        
                    />
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
