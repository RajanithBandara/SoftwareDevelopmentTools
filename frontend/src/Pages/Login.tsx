import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-blue-50">
            {/* Background gradient circles */}
            <div className="absolute w-64 h-64 rounded-full bg-blue-300/80 filter blur-3xl -top-20 -left-20"></div>
            <div className="absolute w-72 h-72 rounded-full bg-purple-300/70 filter blur-3xl -bottom-20 -right-20"></div>
            <div className="absolute w-60 h-60 rounded-full bg-pink-200/60 filter blur-3xl top-1/2 left-1/3"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-10 mx-4 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30"
            >
                <div className="mb-8 text-center">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mb-2 text-3xl font-bold text-blue-900"
                    >
                        AQI Monitor
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-slate-500"
                    >
                        Stay updated with real-time air quality reports
                    </motion.p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 mb-6 text-left border-l-4 border-red-500 bg-red-50/70 backdrop-blur-sm rounded-lg text-red-700"
                    >
                        <p>{error}</p>
                    </motion.div>
                )}

                <form onSubmit={onSubmit} noValidate>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="mb-5"
                    >
                        <div className="overflow-hidden transition-all duration-300 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl focus-within:border-blue-400 focus-within:shadow-blue-300/30 focus-within:shadow-lg">
                            <input
                                className="w-full p-4 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400"
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="mb-6"
                    >
                        <div className="overflow-hidden transition-all duration-300 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl focus-within:border-blue-400 focus-within:shadow-blue-300/30 focus-within:shadow-lg">
                            <input
                                className="w-full p-4 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 1 }}
                            type="submit"
                            disabled={loading}
                            className={`relative w-full p-4 font-semibold text-white transition-all rounded-2xl ${
                                loading
                                    ? "bg-gradient-to-r from-blue-400 to-blue-500"
                                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:shadow-blue-500/30"
                            } flex items-center justify-center`}
                        >
                            {loading ? (
                                <>
                                    <svg className="w-5 h-5 mr-2 -ml-1 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Signing In</span>
                                </>
                            ) : 'Sign In'}
                        </motion.button>
                    </motion.div>
                </form>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="mt-7 text-center text-slate-500"
                >
                    Don't have an account?{' '}
                    <a href="/register" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
                        Register now
                    </a>
                </motion.p>
            </motion.div>
        </div>
    );
};

export default Login;