import { useState, useEffect, useCallback } from 'react';
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

    // Use useCallback to memoize the fetchShifts function.
    // This prevents the function from being re-created on every render,
    // which was causing the infinite loop.
    const fetchShifts = useCallback(async () => {
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
    }, [user, authLoading]); // The dependencies for useCallback are the same as useEffect

    useEffect(() => {
        // We now call fetchShifts inside this useEffect, which will run when
        // the dependencies (user, authLoading) change.
        fetchShifts();
    }, [fetchShifts]); // Pass the memoized function here

    return { shifts, loading, error, fetchShifts };
};
