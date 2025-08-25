import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from './useAuth.jsx';

/**
 * A custom hook to fetch a list of users based on the authenticated user's role.
 * This hook handles loading and error states and automatically re-fetches data if the user changes.
 */
export const useUserList = () => {
    const { user, loading: authLoading } = useAuth();
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Only fetch data if the user is authenticated and we have their role
        if (authLoading || !user) {
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            let url = 'api/users/';
            let params = {};

            // Determine the correct API endpoint based on the user's role
            // The backend's get_queryset will handle the filtering.
            // We just need to hit the correct base endpoint.
            if (user.role === 'branch_manager' || user.role === 'employee') {
                // A branch manager can only see users in their own branch.
                // The backend automatically filters this based on the authenticated user's branch.
                url = `api/users/`;
            } else if (user.role === 'region_manager') {
                // A region manager can only see users in their region.
                // The backend automatically filters this based on the authenticated user's region.
                url = `api/users/`;
            } else if (user.role === 'head_office') {
                // The Head Office can see all users.
                url = `api/users/`;
            } else {
                // For any other role or no role, do not fetch data.
                setLoading(false);
                return;
            }

            try {
                // Make the API request with the correct URL
                const response = await apiClient.get(url, { params });
                setUserList(response.data);
            } catch (err) {
                console.error('Failed to fetch user list:', err);
                setError('Failed to load user data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user, authLoading]); // Re-run the effect if the user object changes

    return { userList, loading, error };
};
