import { useState } from "react";
import type { AuthCredentials } from "../../models/types";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm() {
    const { handleLogin } = useAuth();
    const [formData, setFormData] = useState<AuthCredentials>({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await handleLogin( { email: formData.email, password: formData.password });
            setFormData({
                email: "",
                password: "",
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form 
            onSubmit={handleSubmit} 
            className="flex flex-col space-y-8"
        >
            <div className="space-y-2">
                <h2>Log In</h2>
            </div>

            <div className="space-y-2">
                <label className="block tracking-wider">Email Address</label>
                <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter Email"
                    className="appearance-none w-full border-1 p-4 focus:outline-none placeholder-gray-400"
                />
            </div>

            <div className="space-y-2">
                <label className="block tracking-wider">Password</label>
                <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter Password"
                    className="appearance-none w-full border-1 p-4 focus:outline-none placeholder-gray-400"
                />
            </div>

            <button 
                type="submit"
                className="bg-rose-300 hover:bg-rose-200 w-full p-4 font-bold"
            >
                {loading ? "Signing In..." : "Sign In"}
            </button>

            {error && (
                <div className="p-3 border-2 border-red-600 bg-red-100 text-red-600 font-mono">
                    {error}
                </div>
            )}
        </form>
    )
}