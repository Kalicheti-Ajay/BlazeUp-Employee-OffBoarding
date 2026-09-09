import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LogIn,
    ShieldCheck,
    UserRound,
    LockKeyhole
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const demoAccounts = [
    {
        label: "HR Admin",
        email: "hr@blazeup.demo",
        password: "Demo@123"
    },
    {
        label: "Manager",
        email: "manager@blazeup.demo",
        password: "Demo@123"
    },
    {
        label: "Admin",
        email: "admin@blazeup.demo",
        password: "Demo@123"
    },
    {
        label: "Accounts",
        email: "accounts@blazeup.demo",
        password: "Demo@123"
    },
    {
        label: "Personnel",
        email: "personnel@blazeup.demo",
        password: "Demo@123"
    }
];

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!form.email || !form.password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            await login(
                form.email,
                form.password
            );

            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    const selectDemoAccount = (account) => {
        setForm({
            email: account.email,
            password: account.password
        });

        setError("");
    };

    return (
        <div className="login-page">

            <div className="login-brand">
                <div className="brand-mark">
                    <ShieldCheck size={28} />
                </div>

                <div style={{ color: "#fff" }}>
                    <h1>BlazeUp HROS</h1>
                    <p>Employee Offboarding</p>
                </div>
            </div>

            <div className="login-card">

                <div className="login-header">
                    <div className="login-icon">
                        <LogIn size={22} />
                    </div>

                    <div>
                        <h2>Welcome back</h2>
                        <p>
                            Sign in to manage employee offboarding.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">
                        <label>Email address</label>

                        <div className="input-with-icon">
                            <UserRound size={18} />

                            <input
                                type="email"
                                name="email"
                                placeholder="you@blazeup.com"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <div className="input-with-icon">
                            <LockKeyhole size={18} />

                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner spinner-small" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Sign in
                            </>
                        )}
                    </button>

                </form>

                <div className="demo-section">

                    <div className="demo-title">
                        Development accounts
                    </div>

                    <div className="demo-buttons">
                        {demoAccounts.map((account) => (
                            <button
                                key={account.email}
                                type="button"
                                className="demo-button"
                                onClick={() =>
                                    selectDemoAccount(account)
                                }
                            >
                                {account.label}
                            </button>
                        ))}
                    </div>

                </div>

            </div>

            <p className="login-footer">
                BlazeUp HROS • Employee Offboarding Automation
            </p>

        </div>
    );
}

export default Login;
