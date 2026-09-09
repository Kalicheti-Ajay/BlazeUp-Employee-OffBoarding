
import {
    useState
} from "react";

import {
    Navigate,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";


function Login() {

    const {
        login,
        isAuthenticated
    } = useAuth();

    const navigate =
        useNavigate();


    const [
        email,
        setEmail
    ] = useState("");


    const [
        password,
        setPassword
    ] = useState("");


    const [
        error,
        setError
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(false);


    if (isAuthenticated) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }


    const handleSubmit =
        async (event) => {

            event.preventDefault();

            setError("");
            setLoading(true);

            try {

                await login(
                    email,
                    password
                );

                navigate(
                    "/dashboard"
                );

            } catch (error) {

                setError(
                    error.response
                        ?.data
                        ?.message
                    || "Invalid email or password"
                );

            } finally {

                setLoading(false);

            }
        };


    return (
        <div className="login-page">

            <div className="login-decoration">

                <div className="login-grid" />

                <div className="login-brand">

                    <div className="brand-mark large">
                        B
                    </div>

                    <span>
                        BlazeUp HROS
                    </span>

                </div>

                <div className="login-heading">

                    <span className="eyebrow">
                        EMPLOYEE OPERATIONS
                    </span>

                    <h2>
                        A smarter way to
                        manage employee
                        transitions.
                    </h2>

                    <p>
                        Centralize approvals,
                        clearance, audit trails
                        and offboarding workflows
                        in one place.
                    </p>

                </div>

            </div>


            <div className="login-panel">

                <div className="login-form-container">

                    <div className="mobile-login-logo">
                        <div className="brand-mark">
                            B
                        </div>

                        <strong>
                            BlazeUp HROS
                        </strong>
                    </div>


                    <div className="login-header">

                        <span className="eyebrow">
                            WELCOME BACK
                        </span>

                        <h1>
                            Sign in
                        </h1>

                        <p>
                            Access your employee
                            operations workspace.
                        </p>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">

                            <label>
                                Work email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="you@company.com"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <div className="label-row">

                                <label>
                                    Password
                                </label>

                                <span>
                                    Secure access
                                </span>

                            </div>

                            <input
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your password"
                                required
                            />

                        </div>


                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}


                        <button
                            className="primary-button login-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign in"}
                        </button>

                    </form>


                    <div className="login-footer">
                        BlazeUp HROS · Employee
                        Offboarding Automation
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;