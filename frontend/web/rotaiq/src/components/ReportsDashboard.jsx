import React from 'react';
import { Paper, Title, Text, SimpleGrid, Card } from '@mantine/core';

import { useAnalytics } from '../hooks/useAnalytics.jsx';


const ChartPlaceholder = ({ title, data }) => (
    <Card shadow="md" p="md" withBorder>
        <Title order={4}>{title}</Title>
        <pre>
            {JSON.stringify(data, null, 2)}
        </pre>
    </Card>
);

const ReportsDashboard = ({ shifts }) => {
    // Add a check for the shifts prop.
    if (!shifts) {
        return <Text>Loading reports...</Text>;
    }

    const openShifts = shifts.filter(shift => shift.status === 'open');
    const claimedShifts = shifts.filter(shift => shift.status === 'claimed');
    const filledShifts = shifts.filter(shift => shift.status === 'filled');

    const totalShifts = shifts.length;

    const reportData = {
        totalShifts: totalShifts,
        openShifts: openShifts.length,
        claimedShifts: claimedShifts.length,
        filledShifts: filledShifts.length
    };

    return (
        <Paper shadow="md" p="md" withBorder>
            <Title order={2} mb="md">Analytics Reports</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <ChartPlaceholder title="Shift Overview" data={reportData} />
            </SimpleGrid>
        </Paper>
    );
};

export default ReportsDashboard;
