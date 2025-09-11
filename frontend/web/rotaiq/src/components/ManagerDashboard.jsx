import React, { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Text,
    LoadingOverlay,
    Select,
    Accordion,
    Paper,
    Grid,
    rem
} from '@mantine/core';

import ManagerShiftList from '../components/ManagerShiftList.jsx';
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
    const { userList, loading: userLoading, error: userError, fetchUsers } = useUserList();
    const { branches, loading: branchesLoading, error: branchesError, fetchBranches } = useBranchList();
    const { regions, loading: regionsLoading, error: regionsError } = useRegionList();
    const { shifts, loading: shiftsLoading, error: shiftsError, fetchShifts } = useShiftList();

    const [selectedBranchId, setSelectedBranchId] = useState(null);

    const isLoading = authLoading || userLoading || branchesLoading || regionsLoading || shiftsLoading;
    const isError = authError || userError || branchesError || regionsError || shiftsLoading;

    useEffect(() => {
        fetchUsers();
        fetchBranches();
        fetchShifts();
    }, [fetchUsers, fetchBranches, fetchShifts]);

    if (isLoading) {
        return <LoadingOverlay visible={true} />;
    }

    if (isError) {
        return <Text c="red">Error: Failed to load data. Please check your network connection and try again.</Text>;
    }
    
    // Check for shifts to prevent a null error.
    if (!shifts) {
      return <LoadingOverlay visible={true} />;
    }

    const userRegionId = user.branch?.region?.id;
    const availableBranches = (branches || [])
        .filter(b => b.region && b.region.id === userRegionId)
        .map(b => ({ value: b.id.toString(), label: b.name }));
    const regionalStaff = (userList || []).filter(u => u.branch?.region?.id === userRegionId);
    const regionalShifts = (shifts || []).filter(s => s.branch_details?.region?.id === userRegionId);

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return (
                    <Paper shadow="sm" p="lg" withBorder>
                        <Title order={2}>Manager Dashboard</Title>
                        <Text>Welcome back, {user.first_name}! Here is your shift overview.</Text>
                        <ManagerShiftList
                            viewType="all_shifts"
                            shifts={regionalShifts}
                            staffList={regionalStaff}
                            onUpdate={fetchShifts}
                        />
                    </Paper>
                );
            case 'create-shift':
                return (
                    <Paper shadow="sm" p="lg" withBorder>
                        <Title order={2}>Create New Shift</Title>
                        <Text>Fill out the form to create a new shift.</Text>
                        <ShiftPostForm
                            onShiftPosted={fetchShifts}
                            branches={availableBranches}
                        />
                    </Paper>
                );
            case 'analytics':
                return (
                    <Paper shadow="sm" p="lg" withBorder>
                        <Title order={2}>Analytics</Title>
                        <Text>View all analytics charts and reports here.</Text>
                        <Grid mt="lg">
                            <Grid.Col span={12}>
                                <Accordion defaultValue="analytics-filters">
                                    <Accordion.Item value="analytics-filters">
                                        <Accordion.Control>Analytics Filters</Accordion.Control>
                                        <Accordion.Panel>
                                            <Paper shadow="md" p="md" withBorder>
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
                                                <AnalyticsReport user={user} selectedBranchId={selectedBranchId} />
                                            </Paper>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                </Accordion>
                            </Grid.Col>
                        </Grid>
                    </Paper>
                );
            case 'invitations':
                const availableRoles = [
                    ...(user.role === 'region_manager' ? [{ value: 'region_manager', label: 'Region Manager' }] : []),
                    { value: 'branch_manager', label: 'Branch Manager' },
                    { value: 'employee', label: 'Employee' },
                    { value: 'floating_employee', label: 'Floating Employee' }
                ].filter(role => user.role === 'region_manager' || role.value !== 'region_manager');

                const invitationBranches = (branches || [])
                    .filter(b => b.region?.id === userRegionId)
                    .map(b => ({ value: b.id.toString(), label: b.name }));

                return (
                    <Paper shadow="sm" p="lg" withBorder>
                        <Title order={2}>Invite New Staff</Title>
                        <Text>Send an invitation to a new staff member.</Text>
                        <StaffInvitationForm
                            branches={invitationBranches}
                            roles={availableRoles}
                            userBranchId={user.branch?.id}
                            currentUserRole={user.role}
                        />
                    </Paper>
                );
            default:
                return <Text>Select an option from the sidebar.</Text>;
        }
    };

    return (
        <Container fluid>
            {renderContent()}
        </Container>
    );
};

export default ManagerDashboard;