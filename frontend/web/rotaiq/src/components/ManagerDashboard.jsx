import React from 'react';
import { useUserList } from '../hooks/useUserList.jsx';
import { useShiftList } from '../hooks/useShiftList.jsx';
import { useAnalytics } from '../hooks/useAnalytics.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useBranchList } from '../hooks/useBranchList.jsx';
import { useRegionList } from '../hooks/useRegionList.jsx';
import { Container, Title, Text, Paper, List, Grid, Accordion, LoadingOverlay } from '@mantine/core';

// Import the new components
import ShiftList from './ShiftList.jsx';
import ShiftPostForm from './ShiftPostForm.jsx';
import ReportsDashboard from './ReportsDashboard.jsx';
import StaffInvitationForm from './StaffInvitationForm.jsx'; // Import the new form

const UserList = ({ users, title }) => (
    <Paper withBorder shadow="md" p="md" mt="lg">
        <Title order={3}>{title}</Title>
        <List mt="sm">
            {users.map((u) => (
                <List.Item key={u.id}>
                    {u.first_name} {u.last_name} ({u.role})
                </List.Item>
            ))}
        </List>
    </Paper>
);

const ManagerDashboard = () => {
    // Corrected: Add useAuth hook
    const { user, loading: authLoading, error: authError } = useAuth();
    const { userList, loading: userLoading, error: userError } = useUserList();
    const { shifts, loading: shiftsLoading, error: shiftsError, fetchShifts } = useShiftList();
    const { branches, loading: branchesLoading, error: branchesError } = useBranchList(); // Use the new hook
    const { regions, loading: regionsLoading, error: regionsError } = useRegionList();


    const { data: openShiftsData, loading: analyticsLoading, error: analyticsError } = user?.branch?.id
        ? useAnalytics('open_shifts_by_branch', { branch_id: user.branch.id })
        : { data: [], loading: false, error: null };

    // Update loading and error checks to include all hooks
    const isLoading = authLoading || userLoading || shiftsLoading || analyticsLoading || branchesLoading;
    const isError = authError || userError || shiftsError || analyticsError || branchesError;

    // Handle loading state
    if (isLoading) {
        return <LoadingOverlay visible={true} />;
    }

    // Handle error state
    if (isError) {
        return <Text color="red">Error: Failed to load data. Please check your network connection and try again.</Text>;
    }

    const formattedBranches = branches.map(b => ({ value: b.id.toString(), label: b.name }));


        let availableRoles = [];
    let availableBranches = [];
    let showBranchSelect = true;

    if (user.role === 'branch_manager') {
        // A branch manager can invite another branch manager or employees to their branch
        availableRoles = [
            { value: 'branch_manager', label: 'Branch Manager' },
            { value: 'employee', label: 'Employee' },
            { value: 'floating_employee', label: 'Floating Employee' }
        ];
        // They can only invite to their own branch
        availableBranches = user.branch ? [{ value: user.branch.id.toString(), label: user.branch.name }] : [];
        showBranchSelect = false; // Hide the branch select since it's pre-filled
    } else if (user.role === 'region_manager') {
        // A region manager can invite a region manager, branch manager, or employee
        availableRoles = [
            { value: 'region_manager', label: 'Region Manager' },
            { value: 'branch_manager', label: 'Branch Manager' },
            { value: 'employee', label: 'Employee' },
            { value: 'floating_employee', label: 'Floating Employee' }
        ];
        // They can invite to any branch within their region
        availableBranches = branches
            .filter(b => b.region.id === user.region.id)
            .map(b => ({ value: b.id.toString(), label: b.name }));
    }

    return (
        <Container>
            <Title order={2}>Manager Dashboard</Title>
            <Text>Manage your branch's team, schedule, and operations here. You can assign shifts and invite new employees.</Text>

            <Accordion defaultValue="shift-list" mt="lg">
                <Accordion.Item value="post-shift">
                    <Accordion.Control>Post a New Shift</Accordion.Control>
                    <Accordion.Panel>
                        <ShiftPostForm onUpdate={fetchShifts} />
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="shift-list">
                    <Accordion.Control>All Shifts</Accordion.Control>
                    <Accordion.Panel>
                        <ShiftList shifts={shifts} onUpdate={fetchShifts} />
                    </Accordion.Panel>
                </Accordion.Item>

            <Accordion.Item value="invite-staff">
                <Accordion.Control>Invite New Staff</Accordion.Control>
                <Accordion.Panel>
                    <StaffInvitationForm
                        branches={availableBranches}
                        roles={availableRoles}
                        userBranchId={user.branch.id.toString()}
                        currentUserRole={user.role}
                    />
                </Accordion.Panel>
            </Accordion.Item>

                <Accordion.Item value="reports">
                    <Accordion.Control>Open Shifts Analytics</Accordion.Control>
                    <Accordion.Panel>
                        <ReportsDashboard data={openShiftsData} loading={analyticsLoading} error={analyticsError} />
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Container>
    );
};

export default ManagerDashboard;
