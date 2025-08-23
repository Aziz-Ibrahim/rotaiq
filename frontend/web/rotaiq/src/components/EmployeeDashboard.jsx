import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import ShiftList from './ShiftList';
import { useAuth } from '../hooks/useAuth';
import { Paper, Title } from '@mantine/core';

const EmployeeDashboard = () => {
  const [shifts, setShifts] = useState([]);
  const { user } = useAuth();

  const fetchShifts = async () => {
    try {
      const response = await apiClient.get('api/shifts/');
      setShifts(response.data);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchShifts();
    }
  }, [user]);

  return (
    <Paper shadow="md" p="md" withBorder>
      <Title order={2} mb="md">Available Shifts</Title>
      <ShiftList shifts={shifts.filter(s => s.status === 'open' || s.claimed_by === user.user_id)} onUpdate={fetchShifts} />
    </Paper>
  );
};

export default EmployeeDashboard;