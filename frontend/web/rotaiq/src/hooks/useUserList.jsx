import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { notifications } from '@mantine/notifications';

export const useUserList = () => {
    const [userList, setUserList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // This function will be returned by the hook, allowing other components to call it.
    // The useCallback hook ensures the function reference remains stable.
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/api/users/');
            setUserList(response.data);
        } catch (err) {
            console.error('Failed to fetch user list:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Failed to load staff list.');
            notifications.show({
                title: 'Staff Load Error',
                message: 'Failed to load the staff list.',
                color: 'red',
            });
            setUserList([]); // Set to an empty array on error to prevent crashes
        } finally {
            setLoading(false);
        }
    }, []);

    // This useEffect will run only once on component mount to perform the initial fetch.
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // This structure exposes both the data and the function.
    return { userList, loading, error, fetchUsers };
};