import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import ShiftList from './ShiftList';
import ShiftPostForm from './ShiftPostForm';
import { useAuth } from '../hooks/useAuth';
import { Grid, Paper, Title } from '@mantine/core';

const ManagerDashboard = () => {
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
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Paper shadow="md" p="md" withBorder>
          <ShiftPostForm onUpdate={fetchShifts} />
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Paper shadow="md" p="md" withBorder>
          <Title order={2} mb="md">All Shifts</Title>
          <ShiftList shifts={shifts} onUpdate={fetchShifts} />
        </Paper>
      </Grid.Col>
    </Grid>
  );
};

export default ManagerDashboard;