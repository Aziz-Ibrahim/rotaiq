import React from 'react';
import { useUserList } from '../hooks/useUserList.jsx';
import { useShiftList } from '../hooks/useShiftList.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useBranchList } from '../hooks/useBranchList.jsx';
import { useRegionList } from '../hooks/useRegionList.jsx';
import {
    Container,
    Title,
    Text,
    Paper,
    List,
    Accordion,
    LoadingOverlay
} from '@mantine/core';

import ShiftList from './ShiftList.jsx';
import ShiftPostForm from './ShiftPostForm.jsx';
import StaffInvitationForm from './StaffInvitationForm.jsx';
// Correct: Import the new AnalyticsReport component
import AnalyticsReport from './AnalyticsReport.jsx';

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
    // Hooks and data fetching for the entire dashboard
    const { user, loading: authLoading, error: authError } = useAuth();
    const { userList, loading: userLoading, error: userError } = useUserList();
    const { shifts, loading: shiftsLoading, error: shiftsError, fetchShifts } = useShiftList();
    const { branches, loading: branchesLoading, error: branchesError } = useBranchList();
    const { regions, loading: regionsLoading, error: regionsError } = useRegionList();

    // Check loading and error states from all hooks
    const isLoading = authLoading || userLoading || shiftsLoading || branchesLoading || regionsLoading;
    const isError = authError || userError || shiftsError || branchesError || regionsError;

    if (isLoading) {
        return <LoadingOverlay visible={true} />;
    }

    if (isError) {
        return <Text color="red">Error: Failed to load data. Please check your network connection and try again.</Text>;
    }

    const formattedBranches = branches.map(b => ({ value: b.id.toString(), label: b.name }));

    let availableRoles = [];
    let availableBranches = [];
    let showBranchSelect = true;

    if (user.role === 'branch_manager') {
        availableRoles = [
            { value: 'branch_manager', label: 'Branch Manager' },
            { value: 'employee', label: 'Employee' },
            { value: 'floating_employee', label: 'Floating Employee' }
        ];
        availableBranches = user.branch ? [{ value: user.branch.id.toString(), label: user.branch.name }] : [];
        showBranchSelect = false;
    } else if (user.role === 'region_manager') {
        availableRoles = [
            { value: 'region_manager', label: 'Region Manager' },
            { value: 'branch_manager', label: 'Branch Manager' },
            { value: 'employee', label: 'Employee' },
            { value: 'floating_employee', label: 'Floating Employee' }
        ];
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

                {/* Correct: Render the new AnalyticsReport component and pass the user prop */}
                <AnalyticsReport user={user} />
            </Accordion>
        </Container>
    );
};

export default ManagerDashboard;