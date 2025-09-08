import React, { useState } from 'react';
import { Container, Title, Text, Paper, Select, Grid, Accordion } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';
import { useRegionList } from '../hooks/useRegionList';
import { useBranchList } from '../hooks/useBranchList';
import ReportsDashboard from './ReportsDashboard';
import AnalyticsReport from './AnalyticsReport.jsx'; // Make sure you import this

const HeadOfficeDashboard = () => {
    const { user, loading: userLoading } = useAuth();
    const { regions, loading: regionsLoading } = useRegionList();
    const [selectedRegionId, setSelectedRegionId] = useState(null);
    const [selectedBranchId, setSelectedBranchId] = useState(null);

    const { branches, loading: branchesLoading } = useBranchList(selectedRegionId);

    const regionsForSelect = regions.map(region => ({
        value: region.id.toString(),
        label: region.name,
    }));
    
    const branchesForSelect = branches.map(branch => ({
        value: branch.id.toString(),
        label: branch.name,
    }));

    const handleRegionChange = (value) => {
        setSelectedRegionId(value);
        setSelectedBranchId(null); 
    };

    if (userLoading || regionsLoading || branchesLoading) {
        return <Text>Loading dashboard data...</Text>;
    }

    return (
        <Container fluid>
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
                    {/* Replaced the old Accordion.Item with the new component */}
                    <AnalyticsReport user={user} selectedRegionId={selectedRegionId} selectedBranchId={selectedBranchId} />
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export default HeadOfficeDashboard;