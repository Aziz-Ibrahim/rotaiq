import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

export const useRegionList = () => {
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRegions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/api/regions/');
            setRegions(response.data);
        } catch (err) {
            console.error("Error fetching regions:", err);
            setError('Failed to load regions.');
            setRegions([]); // Ensure it's an array on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRegions();
    }, [fetchRegions]);

    return { regions, loading, error, fetchRegions };
};