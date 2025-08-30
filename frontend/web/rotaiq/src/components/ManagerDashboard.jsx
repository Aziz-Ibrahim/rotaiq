import React from 'react';
import {
    Container,
    Title,
    Text,
    LoadingOverlay,
} from '@mantine/core';

import ShiftList from './ShiftList.jsx';
import ShiftPostForm from './ShiftPostForm.jsx';
import StaffInvitationForm from './StaffInvitationForm.jsx';
import AnalyticsReport from './AnalyticsReport.jsx';
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
    
    const isLoading = authLoading || userLoading || branchesLoading || regionsLoading;
    const isError = authError || userError || branchesError || regionsError;

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
                        <ShiftPostForm onShiftPosted={fetchShifts} />
                    </>
                );
            case 'analytics':
                return (
                    <>
                        <Title order={2}>Analytics</Title>
                        <Text>View all analytics charts and reports here.</Text>
                        <AnalyticsReport user={user} />
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
                            userBranchId={user.branch.id.toString()}
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