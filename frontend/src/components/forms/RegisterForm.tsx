import { useState } from "react";
import type { AuthCredentials } from "../../models/types";
import { registerUser } from "../../services/api";

export default function RegisterForm() {
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
            await registerUser( { email: formData.email, password: formData.password });
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
            className="auth-form"
        >
            <div className="space-y-2">
                <h2>Join OpenDeals</h2>
            </div>

            <div className="space-y-2">
                <label className="field-label">Email Address</label>
                <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter Email"
                    className="field-control"
                />
            </div>

            <div className="space-y-2">
                <label className="field-label">Password</label>
                <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter Password"
                    className="field-control"
                />
            </div>

            <button 
                type="submit"
                className="primary-button"
            >
                {loading ? "Registering..." : "Register"}
            </button>

            {error && (
                <div className="form-error" role="alert">
                    {error}
                </div>
            )}
        </form>
    )
}