import React from 'react';
import {
    Container,
    Title,
    Text,
    Button,
    Stack,
    rem,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NotFoundPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleGoBack = () => {
        // Check if the user is authenticated (user object exists)
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <Container size="md" pt={rem(100)} ta="center">
            <Title order={1} fz={rem(80)}>404</Title>
            <Text fz="lg" mt="md" c="dimmed">
                Oops! The page you're looking for doesn't exist.
            </Text>
            <Stack mt="xl" align="center" gap="md">
                <Button size="lg" radius="xl" variant="filled" onClick={handleGoBack}>
                    Go Back
                </Button>
            </Stack>
        </Container>
    );
};

export default NotFoundPage;