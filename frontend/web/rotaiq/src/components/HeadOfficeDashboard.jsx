import React from 'react';
import { useUserList } from '../hooks/useUserList.jsx';
import { Container, Title, Text, Paper, List } from '@mantine/core';

const UserList = ({ users, title }) => (
    <Paper withBorder shadow="md" p="md" mt="lg">
        <Title order={3}>{title}</Title>
        <List mt="sm">
            {users.map((u) => (
                <List.Item key={u.id}>
                    {u.first_name} {u.last_name} ({u.role})
                </List.Item>
            ))}
        </List>
    </Paper>
);

const HeadOfficeDashboard = () => {
    const { userList, loading, error } = useUserList();

    if (loading) return <Text>Loading user data...</Text>;
    if (error) return <Text color="red">{error}</Text>;

    return (
        <Container>
            <Title order={2}>Head Office Dashboard</Title>
            <Text>Welcome to the central control panel. You have administrative access to all branches and can manage system-wide settings.</Text>
            <UserList users={userList} title="All Users" />
        </Container>
    );
};

export default HeadOfficeDashboard;
