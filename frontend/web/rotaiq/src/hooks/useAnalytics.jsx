import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from './useAuth.jsx';

// A helper function to remove null/undefined values from the filters object
const cleanFilters = (filters) => {
    return Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined)
    );
};

export const useAnalytics = (endpoint, filters = {}) => {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (authLoading) return;

            setLoading(true);
            setError(null);
            
            try {
                // Clean the filters object before creating the query string
                const cleanedFilters = cleanFilters(filters);
                const queryString = new URLSearchParams(cleanedFilters).toString();
                const url = `/api/analytics/${endpoint}/?${queryString}`;
                const response = await apiClient.get(url);
                setData(response.data);
            } catch (err) {
                console.error("Error fetching analytics:", err);
                setError('Failed to load analytics data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // The dependency array now includes the filters object to re-run the effect
    }, [endpoint, authLoading, JSON.stringify(filters)]);

    return { data, loading, error };
};
