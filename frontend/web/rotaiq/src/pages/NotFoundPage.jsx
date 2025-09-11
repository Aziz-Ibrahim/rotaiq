import React from 'react';
import {
    Container,
    Title,
    Text,
    Button,
    Stack,
    Center, // Import Center
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NotFoundPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleGoBack = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <Center style={{ minHeight: '100vh' }}>
            <Container size="md" ta="center">
                <Title order={1} style={{ fontSize: '5rem' }}>404</Title>
                <Text fz="lg" mt="md" c="dimmed">
                    Oops! The page you're looking for doesn't exist.
                </Text>
                <Stack mt="xl" align="center" gap="md">
                    <Button size="lg" radius="xl" variant="filled" onClick={handleGoBack}>
                        Go Back
                    </Button>
                </Stack>
            </Container>
        </Center>
    );
};

export default NotFoundPage;
