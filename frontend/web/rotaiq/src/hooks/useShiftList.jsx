import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from './useAuth.jsx';

export const useShiftList = () => {
    const { user, loading: authLoading } = useAuth();
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchShifts = useCallback(async () => {
        if (!user || authLoading) return;

        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('api/shifts/');
            setShifts(response.data);
        } catch (err) {
            console.error("Error fetching shifts:", err);
            setError('Failed to load shifts.');
            setShifts([]); // Ensure it's an array on error
        } finally {
            setLoading(false);
        }
    }, [user, authLoading]);

    useEffect(() => {
        fetchShifts();
    }, [fetchShifts]);

    return { shifts, loading, error, fetchShifts };
};