import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, fetchCurrentUser, logoutUser } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // We just attempt to fetch the user. If the HttpOnly cookie is present and valid, this will succeed.
                const userData = await fetchCurrentUser();
                setUser(userData);
            } catch (err) {
                // 401 Unauthorized means no valid cookie
                setUser(null);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (username, password) => {
        await loginUser(username, password); // This will set the HttpOnly cookie in the browser
        const userData = await fetchCurrentUser();
        setUser(userData);
    };

    const register = async (userData) => {
        await registerUser(userData); // This will set the HttpOnly cookie in the browser
        const fetchedUser = await fetchCurrentUser();
        setUser(fetchedUser);
    };

    const logout = async () => {
        try {
            await logoutUser(); // This tells the backend to delete the cookie
        } catch (err) {
            console.error("Logout error", err);
        }
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const userData = await fetchCurrentUser();
            setUser(userData);
        } catch (err) {
            console.error("Failed to refresh user", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
