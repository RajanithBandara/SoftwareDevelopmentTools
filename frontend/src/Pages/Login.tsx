import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("http://localhost:5000/api/users/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed. Please try again.");
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.userRole);
            localStorage.setItem('user', JSON.stringify(data.user));

            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="ios-container">
            {/* Background gradient circles */}
            <div className="gradient-circle circle-1"></div>
            <div className="gradient-circle circle-2"></div>
            <div className="gradient-circle circle-3"></div>

            <div className="glass-card">
                <div className="header">
                    <h2 className="title">AQI Monitor</h2>
                    <p className="subtitle">Stay updated with real-time air quality reports</p>
                </div>

                {error && (
                    <div className="error-glass">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={onSubmit} noValidate>
                    <div className="form-group">
                        <div className="input-glass">
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="Email Address"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-glass">
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`ios-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                <span>Signing In</span>
                            </>
                        ) : 'Sign In'}
                    </button>
                </form>

                <p className="register-text">
                    Don't have an account?{' '}
                    <a href="/register" className="register-link">
                        Register now
                    </a>
                </p>
            </div>

