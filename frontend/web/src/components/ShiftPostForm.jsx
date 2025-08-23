import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';

const ShiftPostForm = ({ onUpdate }) => {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        start_time: '',
        end_time: '',
        role: '',
        description: '',
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // This is the fix: Exit early if the user is not yet available.
    if (!user) {
        return <div>Loading...</div>;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            const branchId = user.branch_id; // This line now runs safely
            const shiftData = {
                ...formData,
                branch: branchId
            };

            await apiClient.post('/shifts/', shiftData);

            setSuccess(true);
            setFormData({ start_time: '', end_time: '', role: '', description: '' });
            onUpdate();
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.detail || "An unexpected error occurred.");
            } else {
                setError("Network error. Please try again.");
            }
            console.error("Error posting shift:", err);
        }
    };

    return (
        <div className="shift-post-form">
            <h3>Post a New Shift</h3>
            <form onSubmit={handleSubmit}>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {success && <div style={{ color: 'green' }}>Shift posted successfully!</div>}
                <div style={{ marginBottom: '10px' }}>
                    <label>Your Branch ID:</label>
                    <input
                        type="text"
                        value={user.branch_id}
                        readOnly
                        disabled
                        style={{ marginLeft: '10px' }}
                    />
                </div>
                <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} required />
                <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} required />
                <input type="text" name="role" placeholder="Role (e.g., cashier)" value={formData.role} onChange={handleChange} required />
                <textarea name="description" placeholder="Shift description" value={formData.description} onChange={handleChange}></textarea>
                <button type="submit">Post Shift</button>
            </form>
        </div>
    );
};

export default ShiftPostForm;