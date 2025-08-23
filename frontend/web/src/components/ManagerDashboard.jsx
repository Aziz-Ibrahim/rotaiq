import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import ShiftList from './ShiftList';
import ShiftPostForm from './ShiftPostForm';
import '../App.css';

const ManagerDashboard = () => {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // This function fetches the data from the API
    const fetchShifts = async () => {
        try {
            const response = await apiClient.get('/shifts/');
            // Updating the state here causes the component to re-render
            setShifts(response.data);
        } catch (err) {
            setError("Failed to fetch shifts. Please try again.");
            console.error("Error fetching shifts:", err);
        } finally {
            setLoading(false);
        }
    };

    // This hook runs only once on component mount
    useEffect(() => {
        fetchShifts();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard-main"> {/* Use the class here */}
      <div className="dashboard-section">
        <ShiftPostForm onUpdate={fetchShifts} />
      </div>
      <div className="dashboard-section">
        <h2>All Shifts</h2>
        <ShiftList shifts={shifts} onUpdate={fetchShifts} />
      </div>
    </div>
  );
};

export default ManagerDashboard;