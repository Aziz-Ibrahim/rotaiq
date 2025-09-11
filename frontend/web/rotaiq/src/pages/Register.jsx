import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, TextInput, Paper, Text, Title, Group, LoadingOverlay, Center, Container } from '@mantine/core';

import apiClient from '../api/apiClient';

const Register = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [invitationEmail, setInvitationEmail] = useState('');

    const token = searchParams.get('token');

    useEffect(() => {
        const fetchInvitationDetails = async () => {
            if (!token) {
                setError('No invitation token found in the URL.');
                setLoading(false);
                return;
            }

            try {
                const response = await apiClient.get(`api/invitations/details/?token=${token}`);
                const { first_name, last_name, email } = response.data;

                setFirstName(first_name || '');
                setLastName(last_name || '');
                setInvitationEmail(email);
            } catch (err) {
                setError(err.response?.data?.detail || 'Invalid or expired invitation token.');
            } finally {
                setLoading(false);
            }
        };

        fetchInvitationDetails();
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

    if (loading) {
        return <LoadingOverlay visible={true} />;
    }

    if (error) {
        return (
            <Center style={{ minHeight: '100vh' }}>
                <Paper p="lg" shadow="xs">
                    <Text color="red" size="lg" weight={500}>{error}</Text>
                </Paper>
            </Center>
        );
    }

    if (success) {
        return (
            <Center style={{ minHeight: '100vh' }}>
                <Paper p="lg" shadow="xs">
                    <Text color="green" size="lg" weight={500} style={{ textAlign: 'center' }}>
                        {success}
                        <br />
                        You can now log in with your new password.
                        <br />
                        <span style={{ fontWeight: 'bold' }}>{invitationEmail}</span> is your username.
                    </Text>
                    <Button mt="md" onClick={() => navigate('/login')} fullWidth>Go to Login</Button>
                </Paper>
            </Center>
        );
    }

    return (
        <Center style={{ minHeight: '100vh' }}>
            <Container size={420}>
                <Paper p="lg" shadow="xs" className="w-full max-w-md mx-auto my-12">
                    <Title order={2} style={{ textAlign: 'center' }} mb="lg">Create Your Password</Title>
                    <form onSubmit={handleSubmit}>
                        <TextInput
                            label="Email (Your Username)"
                            value={invitationEmail}
                            readOnly
                            disabled
                        />
                        <TextInput
                            label="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter your first name"
                            required
                            mt="md"
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
                    {error && <Text color="red" mt="md" style={{ textAlign: 'center' }}>{error}</Text>}
                </Paper>
            </Container>
        </Center>
    );
};

export default Register;
