import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const useRegionList = () => {
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRegions = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get('/api/regions/');
                setRegions(response.data);
            } catch (err) {
                console.error("Error fetching regions:", err);
                setError('Failed to load regions.');
            } finally {
                setLoading(false);
            }
        };
        fetchRegions();
    }, []);

    return { regions, loading, error };
};
