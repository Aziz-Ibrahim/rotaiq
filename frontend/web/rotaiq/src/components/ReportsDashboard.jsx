import React from 'react';
import { Paper, Text, Loader, Center } from '@mantine/core';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import { getDaysInMonth } from 'date-fns';

const ReportsDashboard = ({ data, loading, error, currentDate }) => {
    if (loading) {
        return (
            <Center style={{ height: 200 }}>
                <Loader size="lg" />
            </Center>
        );
    }
    
    if (error) {
        return <Text c="red">Error: {error}</Text>;
    }

    // Function to generate a full timeline for the month
    const getFullTimelineData = (apiData) => {
        const daysInMonth = getDaysInMonth(currentDate);
        const fullTimeline = [];

        // Initialize every day of the month with a count of 0
        for (let i = 1; i <= daysInMonth; i++) {
            fullTimeline.push({ day: i, open: 0, claimed: 0, approved: 0 });
        }

        // Merge the API data into the full timeline
        apiData.forEach(item => {
            const dayIndex = item.day - 1;
            if (dayIndex >= 0 && dayIndex < fullTimeline.length) {
                fullTimeline[dayIndex] = { ...fullTimeline[dayIndex], ...item };
            }
        });

        return fullTimeline;
    };
    
    // Process the data to include all days
    const chartData = data ? getFullTimelineData(data) : [];

    return (
        <Paper p="md">
            <Text c="dimmed" mb="md" mt="md">
                A visual summary of open shifts over time.
            </Text>
            
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {/* The Bar components are now stacked with different colors */}
                    <Bar dataKey="open" stackId="a" fill="#7B8130" name="Open" />
                    <Bar dataKey="claimed" stackId="a" fill="#81B29A" name="Claimed" />
                    <Bar dataKey="approved" stackId="a" fill="#3D405B" name="Approved" />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default ReportsDashboard;