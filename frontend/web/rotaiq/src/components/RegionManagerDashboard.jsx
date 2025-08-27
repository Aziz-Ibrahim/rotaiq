import React, { useState } from 'react';
import { Container, Title, Text, Paper, Select, Grid, Accordion } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';
import { useBranchList } from '../hooks/useBranchList';
import { useAnalytics } from '../hooks/useAnalytics';
import ReportsDashboard from './ReportsDashboard';

const RegionManagerDashboard = () => {
    const { user, loading: userLoading } = useAuth();
    const [selectedBranchId, setSelectedBranchId] = useState(null);

    // Fetch all branches in the user's region
    const { branches, loading: branchesLoading } = useBranchList(user?.region?.id);
    
    // Fetch analytics data for open shifts, filtered by the selected branch
    const { data: openShiftsData, loading: openShiftsLoading, error: openShiftsError } = useAnalytics(
        'open_shifts_by_branch',
        { branch_id: selectedBranchId }
    );

    // Fetch analytics data for shifts by status, filtered by the selected branch
    const { data: shiftStatusData, loading: statusLoading, error: statusError } = useAnalytics(
        'shifts_by_status',
        { branch_id: selectedBranchId }
    );
    
    const branchesForSelect = branches.map(branch => ({
        value: branch.id.toString(),
        label: branch.name,
    }));

    // Check for loading states
    if (userLoading || branchesLoading) {
        return <Text>Loading dashboard data...</Text>;
    }

    return (
        <Container>
            <Title order={2}>Region Manager Dashboard</Title>
            <Text>View reports for your region and filter by branch.</Text>
            
            <Grid mt="lg">
                <Grid.Col span={12}>
                    {/* The new Accordion component */}
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
                        
                        <Accordion.Item value="open-shifts">
                            <Accordion.Control>Open Shifts by Branch</Accordion.Control>
                            <Accordion.Panel>
                                <ReportsDashboard 
                                    data={openShiftsData} 
                                    loading={openShiftsLoading} 
                                    error={openShiftsError} 
                                />
                            </Accordion.Panel>
                        </Accordion.Item>
                        
                        <Accordion.Item value="shifts-by-status">
                            <Accordion.Control>Shifts by Status</Accordion.Control>
                            <Accordion.Panel>
                                <ReportsDashboard
                                    data={shiftStatusData}
                                    loading={statusLoading}
                                    error={statusError}
                                />
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export default RegionManagerDashboard;
