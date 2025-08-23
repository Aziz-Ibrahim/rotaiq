// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import ManagerRegister from './pages/ManagerRegister';
import Dashboard from './pages/Dashboard';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Login />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="manager-register" element={<ManagerRegister />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);