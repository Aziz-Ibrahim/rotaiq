import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from './useAuth.jsx';

export const useAnalytics = (endpoint) => {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!user || authLoading) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(`api/analytics/${endpoint}/`);
            setData(response.data);
        } catch (err) {
            console.error("Error fetching analytics data:", err);
            setError('Failed to load analytics data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint, user, authLoading]);

    return { data, loading, error };
};
