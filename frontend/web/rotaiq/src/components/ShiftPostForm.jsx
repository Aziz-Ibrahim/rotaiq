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
    });

    const handleSubmit = async (values) => {
        try {
            if (!user || !user.branch_id) {
                console.error("User not authenticated.");
                return;
            }
            const shiftData = { ...values, branch: user.branch_id };
            await apiClient.post('api/shifts/', shiftData);
            form.reset();
            onUpdate();
        } catch (err) {
            console.error("Error posting shift:", err);
        }
    };

    return (
        <Box maw={400} mx="auto" p="md">
            <Title order={3}>Post a New Shift</Title>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <TextInput
                        label="Your Branch ID"
                        value={user?.branch_id || ''}
                        readOnly
                        disabled
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