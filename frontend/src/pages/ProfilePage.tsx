import Layout from "../components/layout/Layout";
import LoginForm from "../components/forms/LoginForm";
import RegisterForm from "../components/forms/RegisterForm";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function ProfilePage() {
    const { user, loading, handleLogout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "register">("login");

    if (loading) {
        return (
            <Layout>
                <div className="page-message">Loading your account...</div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout>
                <div className="account-page auth-page">
                    <div className="auth-intro">
                        <p className="eyebrow">YOUR OPENCIRCLE ACCOUNT</p>
                        <h1>Good finds, <em>kept close.</em></h1>
                    </div>
                    <div className="auth-panel">
                        <div className="auth-mode-switch" role="group" aria-label="Account access">
                            <button
                                type="button"
                                className={authMode === "login" ? "is-selected" : ""}
                                aria-pressed={authMode === "login"}
                                onClick={() => setAuthMode("login")}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                className={authMode === "register" ? "is-selected" : ""}
                                aria-pressed={authMode === "register"}
                                onClick={() => setAuthMode("register")}
                            >
                                Create Account
                            </button>
                        </div>
                        {authMode === "login" ? <LoginForm /> : <RegisterForm />}
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
            <div className="account-page profile-panel">
                <p className="eyebrow">ACCOUNT</p>
                <h1>Good to see you.</h1>
                <p className="profile-email">{user.email}</p>
                <button 
                    className="primary-button logout-button"
                    onClick={onLogoutClick}
                >
                    {isLoggingOut ? "Logging out..." : "Log Out"}
                </button>
            </div>
        </Layout>
    );
}