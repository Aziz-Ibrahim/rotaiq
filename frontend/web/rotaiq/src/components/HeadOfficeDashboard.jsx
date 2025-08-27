import React, { useState } from 'react';
import { Container, Title, Text, Paper, Select, Grid, Accordion } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';
import { useRegionList } from '../hooks/useRegionList';
import { useBranchList } from '../hooks/useBranchList';
import { useAnalytics } from '../hooks/useAnalytics';
import ReportsDashboard from './ReportsDashboard';

const HeadOfficeDashboard = () => {
    const { user, loading: userLoading } = useAuth();
    const { regions, loading: regionsLoading } = useRegionList();
    const [selectedRegionId, setSelectedRegionId] = useState(null);
    const [selectedBranchId, setSelectedBranchId] = useState(null);

    // Fetch branches based on the selected region
    const { branches, loading: branchesLoading } = useBranchList(selectedRegionId);
    
    // Fetch analytics data, filtered by region and branch
    const { data: openShiftsData, loading: analyticsLoading, error: analyticsError } = useAnalytics(
        'open_shifts_by_branch',
        { region_id: selectedRegionId, branch_id: selectedBranchId }
    );
    
    // --- DEMO: SECOND ANALYTICS REPORT ---
    const { data: shiftStatusData, loading: statusLoading, error: statusError } = useAnalytics(
        'shifts_by_status', // Assuming you have a new endpoint for this
        { region_id: selectedRegionId, branch_id: selectedBranchId }
    );

    const regionsForSelect = regions.map(region => ({
        value: region.id.toString(),
        label: region.name,
    }));
    
    const branchesForSelect = branches.map(branch => ({
        value: branch.id.toString(),
        label: branch.name,
    }));

    // Reset branch filter when region changes
    const handleRegionChange = (value) => {
        setSelectedRegionId(value);
        setSelectedBranchId(null); 
    };

    if (userLoading || regionsLoading || branchesLoading) {
        return <Text>Loading dashboard data...</Text>;
    }

    return (
        <Container>
            <Title order={2}>Head Office Dashboard</Title>
            <Text>View all reports and filter by region or branch.</Text>
            
            <Grid mt="lg">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper shadow="md" p="md" withBorder>
                        <Title order={3} mb="md">Analytics Filters</Title>
                        <Select
                            label="Filter by Region"
                            placeholder="All Regions"
                            data={regionsForSelect}
                            value={selectedRegionId}
                            onChange={handleRegionChange}
                            clearable
                            mb="md"
                        />
                        <Select
                            label="Filter by Branch"
                            placeholder="All Branches"
                            data={branchesForSelect}
                            value={selectedBranchId}
                            onChange={setSelectedBranchId}
                            clearable
                            disabled={!selectedRegionId && branches.length === 0}
                        />
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    {/* The new Accordion component */}
                    <Accordion defaultValue="open-shifts">
                        <Accordion.Item value="open-shifts">
                            <Accordion.Control>Open Shifts by Branch</Accordion.Control>
                            <Accordion.Panel>
                                <ReportsDashboard 
                                    data={openShiftsData} 
                                    loading={analyticsLoading} 
                                    error={analyticsError}
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

export default HeadOfficeDashboard;
