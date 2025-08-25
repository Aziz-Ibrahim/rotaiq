import React, { useState } from 'react'; // Added useState here
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import apiClient from '../api/apiClient';
import {
    TextInput,
    PasswordInput,
    Button,
    Paper,
    Title,
    Text,
    Container,
    Group
} from '@mantine/core';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.detail || 'Login failed. Please check your credentials.');
            } else {
                setError('Login failed. Please check your credentials and try again.');
            }
        }
    };

    return (
        <Container size={420} my={40}>
            <Title align="center">
                Welcome back!
            </Title>
            <Text color="dimmed" size="sm" align="center" mt={5}>
                Enter your details to log in.
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={handleSubmit}>
                    <TextInput
                        label="Username"
                        placeholder="Your username"
                        value={username}
                        onChange={(e) => setUsername(e.currentTarget.value)}
                        required
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        required
                        mt="md"
                    />

                    {error && (
                        <Text color="red" size="sm" mt="md" align="center">
                            {error}
                        </Text>
                    )}

                    <Group position="apart" mt="lg">
                        <Button type="submit" fullWidth>
                            Sign in
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Container>
    );
};

export default Login;