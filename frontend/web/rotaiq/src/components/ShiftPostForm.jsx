import React, { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Button, Group, Box, Title, Text, Stack, Select, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DateInput, TimeInput } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth.jsx';
import apiClient from '../api/apiClient.js';
import { useUserList } from '../hooks/useUserList.jsx'; // This hook is used to get the staffList.

const ShiftPostForm = ({ onShiftPosted, staffList }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);

    const form = useForm({
        initialValues: {
            title: '',
            description: '',
            start_time: null,
            end_time: null,
            role: '',
            branch: null,
        },
        validate: {
            title: (value) => (value.trim() === '' ? 'Shift title is required' : null),
            start_time: (value) => (value ? null : 'Start time is required'),
            end_time: (value) => (value ? null : 'End time is required'),
            role: (value) => (value === '' ? 'Please select a role' : null),
            branch: (value) => (value ? null : 'Branch is required'),
        },
    });

    // Fetch the list of branches when the component mounts
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await apiClient.get('/api/branches/');
                // Check if the response data is an array before setting
                if (Array.isArray(response.data)) {
                    setBranches(response.data);
                } else {
                    console.error('API response for branches is not an array:', response.data);
                    setBranches([]);
                }
            } catch (error) {
                console.error('Failed to fetch branches:', error.response?.data || error.message);
                setBranches([]);
            }
        };
        fetchBranches();
    }, []);

    const handleSubmit = async (values) => {
        setLoading(true);
        const shiftData = {
            ...values,
            start_time: values.start_time.toISOString(),
            end_time: values.end_time.toISOString(),
            // Ensure branch ID is an integer
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
    
    // Format the fetched branches for the Select component
    const formattedBranches = (branches || []).map(branch => ({
        value: branch.id.toString(),
        label: branch.name,
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
                        label="Date"
                        placeholder="Select date"
                        {...form.getInputProps('start_time')}
                    />
                    <Group grow>
                        <TimeInput
                            label="Start Time"
                            placeholder="Select start time"
                            icon={<IconClock size="1rem" />}
                            {...form.getInputProps('start_time')}
                        />
                        <TimeInput
                            label="End Time"
                            placeholder="Select end time"
                            icon={<IconClock size="1rem" />}
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