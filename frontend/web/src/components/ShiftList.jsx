import React from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';

const ShiftList = ({ shifts, onUpdate }) => {
    const { user, loading } = useAuth();

    const handleAction = async (shiftId, endpoint) => {
        try {
            await apiClient.post(`/shifts/${shiftId}/${endpoint}/`);
            onUpdate();
        } catch (error) {
            console.error(`Error with ${endpoint} action:`, error);
        }
    };

    if (loading) {
        return <div>Loading shifts...</div>;
    }

    if (!user) {
        return <div>You are not authorized to view this page.</div>;
    }
    
    if (!shifts || shifts.length === 0) {
        return <p>No shifts to display.</p>;
    }

    return (
        <div className="shift-list">
            <ul>
                {shifts.map(shift => {
                    if (!shift) {
                        return null;
                    }

                    const isEmployee = user.role === 'employee';
                    const isManager = user.role === 'manager';

                    return (
                        <li key={shift.id} className="shift-item">
                            <p><strong>Role:</strong> {shift.role}</p>
                            <p><strong>Time:</strong> {new Date(shift.start_time).toLocaleString()} - {new Date(shift.end_time).toLocaleString()}</p>
                            <p><strong>Status:</strong> {shift.status}</p>
                            <p><strong>Description:</strong> {shift.description}</p>
                            
                            {shift.claimed_by_details && (
                                <p><strong>Claimed by:</strong> {shift.claimed_by_details.first_name} {shift.claimed_by_details.last_name}</p>
                            )}
                            
                            {isEmployee && shift.status === 'open' && (
                                <button onClick={() => handleAction(shift.id, 'claim')}>Claim Shift</button>
                            )}
                            
                            {isManager && shift.status === 'claimed' && (
                                <div>
                                    <button onClick={() => handleAction(shift.id, 'approve')}>Approve</button>
                                    <button onClick={() => handleAction(shift.id, 'decline')}>Decline</button>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ShiftList;