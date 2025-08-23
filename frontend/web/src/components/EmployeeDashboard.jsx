import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import ShiftList from './ShiftList';

const EmployeeDashboard = () => {
    const [openShifts, setOpenShifts] = useState([]);
    const [approvedShifts, setApprovedShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchShifts = async () => {
        try {
            const openResponse = await apiClient.get('/shifts/');
            setOpenShifts(openResponse.data);

            const approvedResponse = await apiClient.get('/shifts/my_approved_shifts/');
            setApprovedShifts(approvedResponse.data);
        } catch (err) {
            setError("Failed to fetch shifts. Please try again.");
            console.error("Error fetching shifts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="employee-dashboard">
            <h2>Available Shifts</h2>
            <ShiftList shifts={openShifts} onUpdate={fetchShifts} />
            
            <h2>My Approved Shifts</h2>
            {approvedShifts.length > 0 ? (
                <ShiftList shifts={approvedShifts} />
            ) : (
                <p>You have no approved shifts yet.</p>
            )}
        </div>
    );
};

export default EmployeeDashboard;