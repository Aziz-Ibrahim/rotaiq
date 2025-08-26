import React from 'react';
import { Paper, Title, Text, SimpleGrid, Card } from '@mantine/core';

// This component is now a generic data display for analytics reports.
const ReportsDashboard = ({ title, data, loading, error }) => {
    if (loading) {
        return <Text>Loading reports...</Text>;
    }
    
    if (error) {
        return <Text color="red">Error: {error}</Text>;
    }
    
    // Check if the data is an array and has content
    if (!data || data.length === 0) {
        return <Text>No data available for this report.</Text>;
    }

    return (
        <Paper shadow="md" p="md" withBorder>
            <Title order={2} mb="md">{title}</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={4}>Report Data</Title>
                    {data.map((item, index) => (
                        <div key={index}>
                            <Text fw={700}>{item.name}:</Text> <Text>{item.value}</Text>
                        </div>
                    ))}
                </Card>
            </SimpleGrid>
        </Paper>
    );
};

export default ReportsDashboard;
