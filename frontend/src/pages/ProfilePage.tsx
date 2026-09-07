import Layout from "../components/layout/Layout";
import LoginForm from "../components/forms/LoginForm";
import RegisterForm from "../components/forms/RegisterForm";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function ProfilePage() {
    const { user, loading, handleLogout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    if (loading) {
        return (
            <Layout>
                <div className="p-8 text-center">Loading...</div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout>
                <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-16 md:p-4">
                        <div className="flex flex-col md:flex-1">
                            <LoginForm />
                        </div>
                        
                        <div className="flex flex-col md:flex-1">
                            <RegisterForm />
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    const onLogoutClick = async () => {
        setIsLoggingOut(true);
        try {
            await handleLogout();
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <Layout>
            <div className="p-8">
                <h1 className="text-2xl font-bold">Welcome, {user.email}!</h1>
                <button 
                    className="w-full py-4 font-bold bg-rose-300 hover:bg-rose-200"
                    onClick={onLogoutClick}
                >
                    {isLoggingOut ? "Logging out..." : "Log Out"}
                </button>
            </div>
        </Layout>
    );
}