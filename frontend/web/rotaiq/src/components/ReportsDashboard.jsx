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

const ReportsDashboard = ({ data, loading, error }) => {
    if (loading) {
        return (
            <Center style={{ height: 200 }}>
                <Loader size="lg" />
            </Center>
        );
    }
    
    if (error) {
        return <Text color="red">Error: {error}</Text>;
    }
    
    if (!data || data.length === 0) {
        return <Text>No data available for this report.</Text>;
    }

    return (
        <Paper p="md">
            <Text c="dimmed" mb="md" mt="md">A visual summary of open shifts for each branch.</Text>
            
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#7B8130" />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default ReportsDashboard;
