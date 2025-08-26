import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics.jsx';
import { Paper, Title, Text, SimpleGrid } from '@mantine/core';

// You will install and use a charting library here soon.
// For now, we will just display the raw data.
const ChartPlaceholder = ({ title, data }) => (
    <Paper shadow="md" p="md" withBorder>
        <Title order={4}>{title}</Title>
        <pre>
            {JSON.stringify(data, null, 2)}
        </pre>
    </Paper>
);

const ReportsDashboard = () => {
    const { data: openShifts, loading, error } = useAnalytics('open_shifts_by_branch');

    if (loading) return <Text>Loading reports...</Text>;
    if (error) return <Text color="red">Error: {error}</Text>;

    return (
        <div>
            <Title order={2} mb="md">Analytics Reports</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <ChartPlaceholder title="Open Shifts by Branch" data={openShifts} />
            </SimpleGrid>
        </div>
    );
};

export default ReportsDashboard;
