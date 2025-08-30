import React, { useState, useEffect } from "react";
import {
    Container,
    Title,
    Text,
    Loader,
    Center,
} from "@mantine/core";
import { useAuth } from "../hooks/useAuth.jsx";
import DashboardLayout from "../components/DashboardLayout.jsx";
import HeadOfficeDashboard from "../components/HeadOfficeDashboard";
import RegionManagerDashboard from "../components/RegionManagerDashboard";
import ManagerDashboard from "../components/ManagerDashboard";
import EmployeeDashboard from "../components/EmployeeDashboard";

const Dashboard = () => {
    const { user, loading, logout } = useAuth();
    const [currentView, setCurrentView] = useState('dashboard');

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
                return <HeadOfficeDashboard user={user} currentView={currentView} />;
            case "region_manager":
                return <RegionManagerDashboard user={user} currentView={currentView} />;
            case "branch_manager":
                return <ManagerDashboard user={user} currentView={currentView} />;
            case "employee":
                return <EmployeeDashboard user={user} currentView={currentView} />;
            default:
                return <Text>User role not recognized. Please contact support.</Text>;
        }
    };

    return (
        <DashboardLayout user={user} currentView={currentView} setCurrentView={setCurrentView}>
            {renderDashboard()}
        </DashboardLayout>
    );
};

export default Dashboard;