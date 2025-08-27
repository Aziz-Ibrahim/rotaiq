import React from "react";
import {
    Container,
    Title,
    Text,
    Paper,
    Loader,
    Center,
    Button,
} from "@mantine/core";
import { useAuth } from "../hooks/useAuth.jsx";
import HeadOfficeDashboard from "../components/HeadOfficeDashboard";
import RegionManagerDashboard from "../components/RegionManagerDashboard";
import ManagerDashboard from "../components/ManagerDashboard";
import EmployeeDashboard from "../components/EmployeeDashboard";

const Dashboard = () => {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return (
            <Container>
                <Center style={{ height: "80vh" }}>
                    <Loader size="xl" />
                </Center>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container>
                <Title order={2}>Access Denied</Title>
                <Text>Please log in to view this page.</Text>
            </Container>
        );
    }

    const renderDashboard = () => {
        switch (user.role) {
            case "head_office":
                return <HeadOfficeDashboard user={user} />;
            case "region_manager":
                return <RegionManagerDashboard user={user} />;
            case "branch_manager":
                return <ManagerDashboard user={user} />;
            case "employee":
                return <EmployeeDashboard user={user} />;
            default:
                return <Text>User role not recognized. Please contact support.</Text>;
        }
    };

    return (
        <Container size="xl" my="md">
            <Paper p="lg" shadow="sm" mb="lg">
                <Title order={1}>Welcome, {user.first_name}!</Title>
                <Text mt="md">
                {user.role}
                </Text>
                
                {user.branch && user.branch.region && (
                <Text>
                    {user.branch.name} | {user.branch.region.name}
                </Text>
                )}
                <Button onClick={logout} mt="md">
                    Logout
                </Button>
            </Paper>
            {renderDashboard()}
        </Container>
    );
};

export default Dashboard;
