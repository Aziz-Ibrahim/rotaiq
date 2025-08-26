import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const useBranchList = (regionId = null) => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBranches = async () => {
            setLoading(true);
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
            } finally {
                setLoading(false);
            }
        };
        fetchBranches();
    }, [regionId]);

    return { branches, loading, error };
};
