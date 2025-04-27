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

            <style jsx>{`
        .ios-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f0f5ff;
          padding: 20px;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .gradient-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
        }

        .circle-1 {
          background: rgba(114, 196, 255, 0.8);
          width: 300px;
          height: 300px;
          top: -100px;
          left: -50px;
        }

        .circle-2 {
          background: rgba(145, 107, 255, 0.7);
          width: 350px;
          height: 350px;
          bottom: -100px;
          right: -100px;
        }

        .circle-3 {
          background: rgba(255, 172, 200, 0.6);
          width: 250px;
          height: 250px;
          top: 50%;
          left: 60%;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 24px;
          padding: 40px;
          width: 100%;
          max-width: 380px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          animation: fadeUp 0.8s ease-out;
          position: relative;
          z-index: 10;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .header {
          margin-bottom: 32px;
        }

        .title {
          color: #1e3a8a;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 10px 0;
          letter-spacing: -0.5px;
        }

        .subtitle {
          color: #64748b;
          font-size: 15px;
          font-weight: 400;
          margin: 0;
        }

        .error-glass {
          background: rgba(255, 235, 235, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 24px;
          font-size: 14px;
          border-left: 3px solid rgba(220, 38, 38, 0.8);
          text-align: left;
          color: #b91c1c;
        }
        
        .error-glass p {
          margin: 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .input-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .input-glass:focus-within {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          border-color: rgba(59, 130, 246, 0.3);
        }

        input {
          width: 100%;
          padding: 16px;
          font-size: 16px;
          border: none;
          background: transparent;
          color: #334155;
          box-sizing: border-box;
        }

        input::placeholder {
          color: #94a3b8;
        }

        input:focus {
          outline: none;
        }

        .ios-button {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 14px;
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          width: 100%;
          cursor: pointer;
          margin-top: 12px;
          transition: all 0.3s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .ios-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
        }

        .ios-button:active {
          transform: translateY(1px);
        }

        .ios-button.loading {
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
        }

        .ios-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          margin-right: 10px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .register-text {
          margin-top: 28px;
          font-size: 15px;
          color: #64748b;
        }

        .register-link {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .register-link:hover {
          color: #1d4ed8;
          text-decoration: none;
        }
      `}</style>
        </div>
    );
};

export default Login;