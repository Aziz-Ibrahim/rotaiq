import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from './useAuth.jsx';

/**
 * A custom hook to fetch a list of shifts for the authenticated user.
 * It handles loading and error states and provides a function to manually
 * refresh the list.
 */
export const useShiftList = () => {
    const { user, loading: authLoading } = useAuth();
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchShifts = async () => {
        if (!user || authLoading) return;

        setLoading(true);
        setError(null);
        try {
            // The backend's get_queryset will handle filtering shifts based on
            // the user's role
            const response = await apiClient.get('api/shifts/');
            setShifts(response.data);
        } catch (err) {
            console.error("Error fetching shifts:", err);
            setError('Failed to load shifts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, [user, authLoading]);

    return { shifts, loading, error, fetchShifts };
};
