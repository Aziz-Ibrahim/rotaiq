// src/hooks/useUserList.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from './useAuth.jsx';

export const useUserList = () => {
    const { user, loading: authLoading } = useAuth();
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Do not fetch if auth is still loading or if there's no user
        if (authLoading || !user) {
            setLoading(false);
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            setError(null);

            try {
                // The backend API already handles filtering by role/branch
                // based on the authenticated user
                const response = await apiClient.get('api/users/');
                setUserList(response.data);
            } catch (err) {
                console.error('Failed to fetch user list:', err);
                setError('Failed to load user data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user, authLoading]); // Re-run the effect if the user or authLoading state changes

    return { userList, loading, error };
};