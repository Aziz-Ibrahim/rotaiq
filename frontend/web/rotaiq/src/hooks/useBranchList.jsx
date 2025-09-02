import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

export const useBranchList = (regionId = null) => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Make the fetchBranches function available to components
    const fetchBranches = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '/api/branches/';
            if (regionId) {
                url += `?region_id=${regionId}`;
            }
            const response = await apiClient.get(url);
            setBranches(response.data);
        } catch (err) {
            console.error("Error fetching branches:", err);
            setError('Failed to load branches.');
            setBranches([]); // Ensure it's an array on error
        } finally {
            setLoading(false);
        }
    }, [regionId]);

    // Perform the initial fetch on mount or when regionId changes
    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    // Expose the data and the function
    return { branches, loading, error, fetchBranches };
};