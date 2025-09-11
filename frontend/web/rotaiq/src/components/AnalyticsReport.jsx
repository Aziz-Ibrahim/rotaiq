import React, { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics.jsx';
import { Group, Button, Text, Paper, Stack } from '@mantine/core';
import { format, getMonth, getYear, setMonth } from 'date-fns';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import ReportsDashboard from './ReportsDashboard.jsx';

const AnalyticsReport = ({ user, selectedRegionId, selectedBranchId }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const handlePreviousMonth = () => {
        setCurrentDate(prevDate => setMonth(prevDate, getMonth(prevDate) - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prevDate => setMonth(prevDate, getMonth(prevDate) + 1));
    };

    const getTimelineFilters = () => {
        const filters = {
            year: getYear(currentDate),
            month: getMonth(currentDate) + 1,
        };

        if (user) {
            if (user.role === 'branch_manager' && user.branch) {
                filters.branch_id = user.branch.id;
            } else if (user.role === 'region_manager' && user.region) {
                filters.region_id = user.region.id;
            }
        }

        if (selectedRegionId) {
            filters.region_id = selectedRegionId;
        }
        if (selectedBranchId) {
            filters.branch_id = selectedBranchId;
        }

        return filters;
    };

    const timelineFilters = getTimelineFilters();

    const {
        data: allShiftsData,
        loading: analyticsLoading,
        error: analyticsError
    } = useAnalytics('all-shifts-timeline', timelineFilters);

    return (
        <Paper withBorder shadow="md" p="md" mt="lg">
            <Stack>
                <Group position="apart">
                    <Button variant="light" onClick={handlePreviousMonth} leftIcon={<IconChevronLeft size={16} />} type="button">
                        Previous Month
                    </Button>
                    <Text fw={700}>{format(currentDate, 'MMMM yyyy')}</Text>
                    <Button variant="light" onClick={handleNextMonth} rightIcon={<IconChevronRight size={16} />} type="button">
                        Next Month
                    </Button>
                </Group>
                <ReportsDashboard
                    data={allShiftsData}
                    loading={analyticsLoading}
                    error={analyticsError}
                    currentDate={currentDate}
                />
            </Stack>
        </Paper>
    );
};

export default AnalyticsReport;
