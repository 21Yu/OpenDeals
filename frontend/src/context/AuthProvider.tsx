import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { loginUser, logoutUser, getCurrentUser } from '../services/api';
import type { AuthCredentials, User } from '../models/types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadCurrentUser = async () => {
        try {
            const data = await getCurrentUser();
            setUser(data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    loadCurrentUser();

    }, []);

    const handleLogin = async (credentials: AuthCredentials) => {
        const data = await loginUser(credentials);
        setUser(data.user);
    };

    const handleLogout = async () => {
        await logoutUser();
        setUser(null);
    };


  return <AuthContext.Provider value={{user, loading, handleLogin, handleLogout}}>{children}</AuthContext.Provider>;
}