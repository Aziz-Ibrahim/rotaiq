import React, { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics.jsx';
import { Accordion, Group, Button, Text } from '@mantine/core';
import { format, getMonth, getYear, setMonth } from 'date-fns';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import ReportsDashboard from './ReportsDashboard.jsx';

const AnalyticsReport = ({ user }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const handlePreviousMonth = () => {
        setCurrentDate(prevDate => setMonth(prevDate, getMonth(prevDate) - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prevDate => setMonth(prevDate, getMonth(prevDate) + 1));
    };

    const getTimelineFilters = () => {
        if (!user) {
            return {};
        }
        if (user.role === 'branch_manager') {
            return { branch_id: user.branch.id, year: getYear(currentDate), month: getMonth(currentDate) + 1 };
        } else if (user.role === 'region_manager') {
            return { region_id: user.region.id, year: getYear(currentDate), month: getMonth(currentDate) + 1 };
        } else {
            return { year: getYear(currentDate), month: getMonth(currentDate) + 1 };
        }
    };

    const timelineFilters = getTimelineFilters();

    const {
        data: allShiftsData,
        loading: analyticsLoading,
        error: analyticsError
    } = useAnalytics('all-shifts-timeline', timelineFilters); // Changed endpoint to all-shifts-timeline

    return (
        <Accordion.Item value="reports">
            <Accordion.Control>Shifts Analytics</Accordion.Control>
            <Accordion.Panel>
                <Group position="apart" my="md">
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
            </Accordion.Panel>
        </Accordion.Item>
    );
};

export default AnalyticsReport;
