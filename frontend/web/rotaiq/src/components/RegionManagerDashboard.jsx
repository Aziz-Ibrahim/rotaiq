import React, { useState } from 'react';
import { Container, Title, Text, Paper, Select, Grid, Accordion } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';
import { useBranchList } from '../hooks/useBranchList';
import ReportsDashboard from './ReportsDashboard';
import AnalyticsReport from './AnalyticsReport.jsx'; // Make sure you import this

const RegionManagerDashboard = () => {
    const { user, loading: userLoading } = useAuth();
    const [selectedBranchId, setSelectedBranchId] = useState(null);

    const { branches, loading: branchesLoading } = useBranchList(user?.region?.id);
    
    const branchesForSelect = branches.map(branch => ({
        value: branch.id.toString(),
        label: branch.name,
    }));

    if (userLoading || branchesLoading) {
        return <Text>Loading dashboard data...</Text>;
    }

    return (
        <Container>
            <Title order={2}>Region Manager Dashboard</Title>
            <Text>View reports for your region and filter by branch.</Text>
            
            <Grid mt="lg">
                <Grid.Col span={12}>
                    <Accordion defaultValue="analytics-filters">
                        <Accordion.Item value="analytics-filters">
                            <Accordion.Control>Analytics Filters</Accordion.Control>
                            <Accordion.Panel>
                                <Paper shadow="md" p="md" withBorder>
                                    <Select
                                        label="Filter by Branch"
                                        placeholder="All Branches"
                                        data={branchesForSelect}
                                        value={selectedBranchId}
                                        onChange={setSelectedBranchId}
                                        clearable
                                    />
                                </Paper>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                </Grid.Col>
                <Grid.Col span={12}>
                    {/* Replaced the old Accordion.Item with the new component */}
                    <AnalyticsReport user={user} selectedBranchId={selectedBranchId} />
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export default RegionManagerDashboard;