import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserDetails = async (userId) => {
        try {
            const response = await apiClient.get(`api/users/${userId}/`);
            setUser(response.data);
            console.log("User details fetched:", response.data);
        } catch (error) {
            console.error('Failed to fetch user details:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await apiClient.post('api/token/', { email: username, password });
            
            const { access, refresh } = response.data;
            localStorage.setItem('token', access);
            localStorage.setItem('refresh', refresh);
            
            const decodedToken = jwtDecode(access);
            
            console.log("Decoded Token:", decodedToken);

            await fetchUserDetails(decodedToken.id);

            return response.data;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    const updateUserProfile = (updatedData) => {
        setUser(prevUser => ({
            ...prevUser,
            ...updatedData
        }));
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken && decodedToken.id) {
                    fetchUserDetails(decodedToken.id);
                } else {
                    console.error("Token is missing the 'id' field.");
                    localStorage.clear();
                    setLoading(false);
                }
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.clear();
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};