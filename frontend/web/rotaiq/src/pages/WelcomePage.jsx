import React from 'react';
import {
    Container,
    Title,
    Text,
    Button,
    Stack,
    Image,
    rem,
    Center
} from '@mantine/core';
import { Link } from 'react-router-dom';
import RotaIQLogo from '../assets/rotaiQ.png';

const WelcomePage = () => {
    return (
        <Center style={{ minHeight: '100vh', flexDirection: 'column' }}>
            <Container size="md" ta="center" mx="auto">
                <Image src={RotaIQLogo} alt="RotaIQ Logo" height={160} fit="contain" mb="md" />
                <Title order={1}>Welcome to RotaIQ</Title>
                <Text fz="lg" mt="md" c="dimmed">
                    RotaIQ helps managers post open shifts (rota gaps) and allows staff to claim them in a simple, effective way. Streamline the process of filling last-minute staffing gaps and reduce communication overhead to ensure every site is fully staffed.
                </Text>
                <Stack mt="xl" align="center" gap="md">
                    <Button component={Link} to="/login" size="lg" radius="xl" variant="filled">
                        Log In
                    </Button>
                    <Button component={Link} to="/get-a-quote" size="lg" radius="xl" variant="outline">
                        Get a Quote
                    </Button>
                </Stack>
            </Container>
        </Center>
    );
};

export default WelcomePage;