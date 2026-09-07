import { createContext, useContext } from 'react';
import type { AuthCredentials, User } from '../models/types';

export interface AuthState {
    user: User | null;
    loading: boolean;
    handleLogin: (credentials: AuthCredentials) => Promise<void>;
    handleLogout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuth(): AuthState {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}