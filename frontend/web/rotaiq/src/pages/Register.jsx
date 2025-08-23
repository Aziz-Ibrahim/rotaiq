import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Box, TextInput, PasswordInput, Button, Title, Text, Stack } from '@mantine/core';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'employee',
        branch_id: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await apiClient.post('api/register/', formData);
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Please try again.');
            console.error(err);
        }
    };

    return (
        <Box maw={400} mx="auto" p="md">
            <Title order={2}>Employee Registration</Title>
            {error && <Text color="red">{error}</Text>}
            <form onSubmit={handleSubmit}>
                <Stack>
                    <TextInput label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                    <PasswordInput label="Password" name="password" value={formData.password} onChange={handleChange} required />
                    <TextInput label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required />
                    <TextInput label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                    <TextInput label="Branch ID" name="branch_id" value={formData.branch_id} onChange={handleChange} required />
                    <Button type="submit">Register</Button>
                </Stack>
            </form>
            <Text mt="md">Already have an account? <Link to="/login">Login here</Link></Text>
            <Text>Are you a manager? <Link to="/manager-register">Register as Manager</Link></Text>
        </Box>
    );
};

export default Register;