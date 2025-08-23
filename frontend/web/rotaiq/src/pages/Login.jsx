import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import { Box, TextInput, PasswordInput, Button, Title, Text, Stack } from '@mantine/core';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await apiClient.post('api/token/', { email, password });
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            const userResponse = await apiClient.get('api/users/me/');
            login(userResponse.data);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
            console.error(err);
        }
    };

    return (
        <Box maw={400} mx="auto" p="md">
            <Title order={2}>Login</Title>
            {error && <Text color="red">{error}</Text>}
            <form onSubmit={handleSubmit}>
                <Stack>
                    <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Button type="submit">Login</Button>
                </Stack>
            </form>
            <Text mt="md">Don't have an account? <Link to="/register">Register here</Link></Text>
        </Box>
    );
};

export default Login;