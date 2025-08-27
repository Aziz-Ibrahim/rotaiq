import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, TextInput, Paper, Text, Title, Group } from '@mantine/core';

import apiClient from '../api/apiClient';


const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No invitation token found in the URL.');
    }
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!token) {
      setError('Missing invitation token.');
      setLoading(false);
      return;
    }

    try {
      // Use the publicClient for the unauthenticated request
      const response = await apiClient.post('api/register/', {
        token,
        first_name: firstName,
        last_name: lastName,
        password,
      });
      setSuccess(response.data.message || 'Registration successful!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Paper p="lg" shadow="xs" className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Text color="red" size="lg" weight={500}>{error}</Text>
      </Paper>
    );
  }

  if (success) {
    return (
      <Paper p="lg" shadow="xs" className="flex flex-col items-center justify-center min-h-screen bg-green-50">
        <Text color="green" size="lg" weight={500} className="text-center">
          {success}
          <br />
          You will be redirected to the login page shortly.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="lg" shadow="xs" className="w-full max-w-md mx-auto my-12">
      <Title order={2} className="text-center mb-6">Create Your Password</Title>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter your first name"
          required
        />
        <TextInput
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter your last name"
          required
          mt="md"
        />
        <TextInput
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose a password"
          required
          mt="md"
        />
        <Group mt="xl" position="right">
          <Button type="submit" loading={loading}>Register</Button>
        </Group>
      </form>
      {error && <Text color="red" mt="md" className="text-center">{error}</Text>}
    </Paper>
  );
};

export default Register;