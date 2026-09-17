import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [role, setRole] = useState("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
        console.log("LOGIN REQUEST:");
        console.log("Email:", email);
        console.log("Selected Role:", role);

        const response = await api.post("/auth/login", {
            email: email.trim(),
            password: password
        });

        console.log("LOGIN RESPONSE:", response.data);

        const token = response.data.token;
        const user = response.data.user;

        // Check server response
        if (!token || !user) {
            setError("Invalid response received from server.");
            return;
        }

        console.log("USER:", user);
        console.log("USER ROLE:", user.role);

        // Check selected role
        if (user.role !== role) {
            setError(
                `This account is registered as ${user.role}. Please select ${user.role} login.`
            );
            return;
        }

        // IMPORTANT:
        // AuthContext expects login(userData, token)
        login(user, token);

        // Go to your existing dashboard
        navigate("/dashboard");

    } catch (err) {
        console.error("LOGIN ERROR:", err);

        console.log(
            "STATUS:",
            err.response?.status
        );

        console.log(
            "SERVER RESPONSE:",
            err.response?.data
        );

        setError(
            err.response?.data?.error ||
            err.response?.data?.message ||
            "Invalid email or password."
        );

    } finally {
        setLoading(false);
    }
};

    return (
        <div className="login-page">

            <div className="login-card">

                {/* ================= HEADER ================= */}

                <div className="login-brand">

                    <div className="graduation-cap">
                        🎓
                    </div>

                    <div>
                        <h2>Student Management System</h2>
                        <p>Manage Today, Build Tomorrow</p>
                    </div>

                </div>


                {/* ================= WELCOME ================= */}

                <div className="login-welcome">

                    <h1>Welcome Back</h1>

                    <p>
                        Sign in to continue to your dashboard.
                    </p>

                </div>


                {/* ================= ROLE SELECTOR ================= */}

                <div className="role-selector">

                    {/* STUDENT */}

                    <button
                        type="button"
                        className={
                            role === "student"
                                ? "role-button active"
                                : "role-button"
                        }
                        onClick={() => {
                            setRole("student");
                            setError("");
                        }}
                    >
                        <span className="role-icon">
                            👤
                        </span>

                        <span>
                            Student
                        </span>
                    </button>


                    {/* TEACHER */}

                    <button
                        type="button"
                        className={
                            role === "teacher"
                                ? "role-button active"
                                : "role-button"
                        }
                        onClick={() => {
                            setRole("teacher");
                            setError("");
                        }}
                    >
                        <span className="role-icon">
                            👥
                        </span>

                        <span>
                            Teacher
                        </span>
                    </button>


                    {/* ADMIN */}

                    <button
                        type="button"
                        className={
                            role === "admin"
                                ? "role-button active"
                                : "role-button"
                        }
                        onClick={() => {
                            setRole("admin");
                            setError("");
                        }}
                    >
                        <span className="role-icon">
                            ⚙
                        </span>

                        <span>
                            Admin
                        </span>
                    </button>

                </div>


                {/* ================= LOGIN FORM ================= */}

                <form onSubmit={handleLogin}>

                    {/* EMAIL */}

                    <div className="login-input-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            placeholder="Enter your email"
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="login-input-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            placeholder="Enter your password"
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />

                    </div>


                    {/* ERROR */}

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        className="login-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Login"
                        }
                    </button>

                </form>


                {/* ================= FOOTER ================= */}

                <div className="login-selected-role">

                    Signing in as{" "}

                    <strong>
                        {role.charAt(0).toUpperCase() +
                            role.slice(1)}
                    </strong>

                </div>

            </div>

        </div>
    );
}

export default Login;