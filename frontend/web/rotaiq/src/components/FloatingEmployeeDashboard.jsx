import React from 'react';
import { Container, Title, Text } from '@mantine/core';

const NoRoleDashboard = () => (
    <Container>
        <Title order={2}>Access Denied</Title>
        <Text>Your account does not have a defined role. Please contact your administrator for assistance.</Text>
    </Container>
);

export default NoRoleDashboard;
