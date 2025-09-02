import React, { useState } from 'react';
import { useForm } from '@mantine/form';
import { format } from 'date-fns';
import { TextInput, Button, Group, Box, Title, Text, Stack, Select, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DateInput, TimeInput } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';

import apiClient from '../api/apiClient.js';
import { useAuth } from '../hooks/useAuth.jsx';

// Now accepts branches list as a prop
const ShiftPostForm = ({ onShiftPosted, branches }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            title: '',
            description: '',
            date: null,
            start_time: null,
            end_time: null,
            role: '',
            branch: null,
        },
        validate: {
            title: (value) => (value.trim() === '' ? 'Shift title is required' : null),
            date: (value) => (value ? null : 'Date is required'),
            start_time: (value) => (value ? null : 'Start time is required'),
            end_time: (value) => (value ? null : 'End time is required'),
            role: (value) => (value === '' ? 'Please select a role' : null),
            branch: (value) => (value ? null : 'Branch is required'),
        },
    });

    // Helper function to combine date and time from two separate Date objects
    const combineDateAndTime = (date, timeString) => {
        if (!date || !timeString) return null;
        
        // Split the "HH:mm" string to get hours and minutes
        const [hours, minutes] = timeString.split(':').map(Number);
        
        const combined = new Date(date);
        combined.setHours(hours);
        combined.setMinutes(minutes);
        combined.setSeconds(0);
        combined.setMilliseconds(0);
        
        return combined;
    };

    const handleSubmit = async (values) => {
        setLoading(true);

        const startDateTime = combineDateAndTime(values.date, values.start_time);
        const endDateTime = combineDateAndTime(values.date, values.end_time);

        if (!startDateTime || !endDateTime) {
            notifications.show({
                title: 'Error',
                message: 'Please select both a date and a time.',
                color: 'red',
            });
            setLoading(false);
            return;
        }

        const shiftData = {
            title: values.title,
            description: values.description,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            role: values.role,
            branch: parseInt(values.branch, 10),
        };

        try {
            const response = await apiClient.post('/api/shifts/', shiftData);
            notifications.show({
                title: 'Success',
                message: 'Shift posted successfully!',
                color: 'green',
            });
            form.reset();
            if (onShiftPosted) {
                onShiftPosted(response.data);
            }
        } catch (error) {
            console.error('Shift post failed:', error.response?.data || error.message);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.error || 'Failed to post shift.',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };
    
    // Format the branches prop for the Select component
    const formattedBranches = (branches || []).map(branch => ({
        value: branch.value.toString(),
        label: branch.label,
    }));
    
    const roleOptions = ['branch_manager', 'region_manager', 'employee', 'floating_employee'].map(role => ({
        value: role,
        label: role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    }));
    
    return (
        <Box maw={600} mx="auto">
            <Title order={2} mb="md">Post a New Shift</Title>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <TextInput
                        label="Shift Title"
                        placeholder="e.g., Weekend Cover"
                        {...form.getInputProps('title')}
                    />
                    <Textarea
                        label="Shift Description"
                        placeholder="Provide details about the shift"
                        {...form.getInputProps('description')}
                    />
                    <DateInput
                        placeholder="Shift Date"
                        value={form.values.date}
                        onChange={(date) => {
                            form.setFieldValue('date', date);
                        }}
                        label="Shift Date"
                        {...form.getInputProps('date')}
                    />
                    <Group grow>
                        <TimeInput
                            label="Start Time"
                            placeholder="Select start time"
                            icon={<IconClock size="1rem" />}
                            value={form.values.start_time}
                            onChange={(time) => form.setFieldValue('start_time', time)}
                            {...form.getInputProps('start_time')}
                        />
                        <TimeInput
                            label="End Time"
                            placeholder="Select end time"
                            icon={<IconClock size="1rem" />}
                            value={form.values.end_time}
                            onChange={(time) => form.setFieldValue('end_time', time)}
                            {...form.getInputProps('end_time')}
                        />
                    </Group>
                    <Select
                        label="Required Role"
                        placeholder="Select role"
                        data={roleOptions}
                        {...form.getInputProps('role')}
                    />
                    <Select
                        label="Branch"
                        placeholder="Select branch"
                        data={formattedBranches}
                        searchable
                        {...form.getInputProps('branch')}
                    />
                    <Group position="right" mt="md">
                        <Button type="submit" loading={loading}>
                            Post Shift
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Box>
    );
};

export default ShiftPostForm;
