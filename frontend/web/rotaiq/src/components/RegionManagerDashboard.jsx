import React, { useState } from 'react';
import { Container, Title, Text, Paper, Select, Grid } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';
import { useBranchList } from '../hooks/useBranchList';
import { useAnalytics } from '../hooks/useAnalytics';
import ReportsDashboard from './ReportsDashboard';

const RegionManagerDashboard = () => {
    const { user, loading: userLoading } = useAuth();
    const [selectedBranchId, setSelectedBranchId] = useState(null);

    // Fetch all branches in the user's region
    const { branches, loading: branchesLoading } = useBranchList(user?.region?.id);
    
    // Fetch analytics data, filtered by the selected branch
    const { data: openShiftsData, loading: analyticsLoading } = useAnalytics(
        'open_shifts_by_branch',
        { branch_id: selectedBranchId }
    );
    
    const branchesForSelect = branches.map(branch => ({
        value: branch.id.toString(),
        label: branch.name,
    }));

    if (userLoading || branchesLoading || analyticsLoading) {
        return <Text>Loading dashboard data...</Text>;
    }

    return (
        <Container>
            <Title order={2}>Region Manager Dashboard</Title>
            <Text>View reports for your region and filter by branch.</Text>
            
            <Grid mt="lg">
                <Grid.Col span={12}>
                    <Paper shadow="md" p="md" withBorder>
                        <Title order={3} mb="md">Regional Analytics</Title>
                        <Select
                            label="Filter by Branch"
                            placeholder="All Branches"
                            data={branchesForSelect}
                            value={selectedBranchId}
                            onChange={setSelectedBranchId}
                            clearable
                        />
                    </Paper>
                </Grid.Col>
                <Grid.Col span={12}>
                    <ReportsDashboard data={openShiftsData} title="Open Shifts by Branch" />
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export default RegionManagerDashboard;
