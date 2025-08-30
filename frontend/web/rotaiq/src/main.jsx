import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import ManagerRegister from './pages/ManagerRegister';
import Dashboard from './pages/Dashboard';
import UserProfile from './components/UserProfile'; // Import the new UserProfile component
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';
import { theme } from './theme.js'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider theme={theme}>
        <Notifications position="top-right" />
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Login />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="manager-register" element={<ManagerRegister />} />
            <Route path="dashboard" element={<Dashboard />}>
              <Route path="user-profile" element={<UserProfile />} />
              {/* Add other dashboard-related nested routes here as needed */}
            </Route>
          </Route>
        </Routes>
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);