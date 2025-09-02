import React, { useState } from 'react';
import {
    Container,
    Title,
    Text,
    LoadingOverlay,
    Select,
    Accordion,
    Paper,
    Grid,
} from '@mantine/core';

import ShiftList from '../components/ShiftList.jsx';
import ShiftPostForm from '../components/ShiftPostForm.jsx';
import StaffInvitationForm from '../components/StaffInvitationForm.jsx';
import AnalyticsReport from '../components/AnalyticsReport.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useUserList } from '../hooks/useUserList.jsx';
import { useBranchList } from '../hooks/useBranchList.jsx';
import { useRegionList } from '../hooks/useRegionList.jsx';
import { useShiftList } from '../hooks/useShiftList.jsx';

const ManagerDashboard = ({ currentView }) => {
    const { user, loading: authLoading, error: authError } = useAuth();
    const { userList, loading: userLoading, error: userError } = useUserList();
    const { branches, loading: branchesLoading, error: branchesError } = useBranchList();
    const { regions, loading: regionsLoading, error: regionsError } = useRegionList();
    const { fetchShifts } = useShiftList();

    // New state for branch filtering in analytics
    const [selectedBranchId, setSelectedBranchId] = useState(null);

    const isLoading = authLoading || userLoading || branchesLoading || regionsLoading;
    const isError = authError || userError || branchesError || regionsError;

    if (isLoading) {
        return <LoadingOverlay visible={true} />;
    }

    if (isError) {
        return <Text color="red">Error: Failed to load data. Please check your network connection and try again.</Text>;
    }

    // Unify role-based logic
    const isManager = user.role === 'branch_manager' || user.role === 'region_manager';

    let availableRoles = [];
    let availableBranches = [];

    // Determine roles and branches based on the user's role
    if (user.role === 'branch_manager') {
        availableRoles = [
            { value: 'branch_manager', label: 'Branch Manager' },
            { value: 'employee', label: 'Employee' },
            { value: 'floating_employee', label: 'Floating Employee' }
        ];
        // Now, a branch manager can post for all branches in their region
        availableBranches = branches
            .filter(b => b.region && user.region && b.region.id === user.region.id)
            .map(b => ({ value: b.id.toString(), label: b.name }));
    } else if (user.role === 'region_manager') {
        availableRoles = [
            { value: 'region_manager', label: 'Region Manager' },
            { value: 'branch_manager', label: 'Branch Manager' },
            { value: 'employee', label: 'Employee' },
            { value: 'floating_employee', label: 'Floating Employee' }
        ];
        // Filter branches by region for region managers
        availableBranches = branches
            .filter(b => b.region && user.region && b.region.id === user.region.id)
            .map(b => ({ value: b.id.toString(), label: b.name }));
    }

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return (
                    <>
                        <Title order={2}>Manager Dashboard</Title>
                        <Text>Welcome back, {user.first_name}! Here is your shift overview.</Text>
                        <ShiftList viewType="all_shifts" onUpdate={fetchShifts} />
                    </>
                );
            case 'create-shift':
                return (
                    <>
                        <Title order={2}>Create New Shift</Title>
                        <Text>Fill out the form to create a new shift.</Text>
                        {/* The ShiftPostForm now uses the user's role to determine available branches */}
                        <ShiftPostForm 
                            onShiftPosted={fetchShifts} 
                            branches={availableBranches} 
                            userRole={user.role} 
                            userBranchId={user.branch?.id}
                        />
                    </>
                );
            case 'analytics':
                return (
                    <>
                        <Title order={2}>Analytics</Title>
                        <Text>View all analytics charts and reports here.</Text>
                        <Grid mt="lg">
                            <Grid.Col span={12}>
                                <Accordion defaultValue="analytics-filters">
                                    <Accordion.Item value="analytics-filters">
                                        <Accordion.Control>Analytics Filters</Accordion.Control>
                                        <Accordion.Panel>
                                            <Paper shadow="md" p="md" withBorder>
                                                {/* Conditionally show the branch filter for region managers */}
                                                {user.role === 'region_manager' && (
                                                    <Select
                                                        label="Filter by Branch"
                                                        placeholder="All Branches"
                                                        data={availableBranches}
                                                        value={selectedBranchId}
                                                        onChange={setSelectedBranchId}
                                                        clearable
                                                    />
                                                )}
                                                {/* Pass the branch ID to the report component */}
                                                <AnalyticsReport user={user} selectedBranchId={selectedBranchId} />
                                            </Paper>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                </Accordion>
                            </Grid.Col>
                        </Grid>
                    </>
                );
            case 'invitations':
                return (
                    <>
                        <Title order={2}>Invite New Staff</Title>
                        <Text>Send an invitation to a new staff member.</Text>
                        <StaffInvitationForm
                            branches={availableBranches}
                            roles={availableRoles}
                            userBranchId={user.branch?.id}
                            currentUserRole={user.role}
                        />
                    </>
                );
            default:
                return <Text>Select an option from the sidebar.</Text>;
        }
    };

    return (
        <Container>
            {renderContent()}
        </Container>
    );
};

export default ManagerDashboard;
