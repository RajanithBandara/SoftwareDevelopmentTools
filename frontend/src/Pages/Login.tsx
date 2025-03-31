import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LoginFormData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/users/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.userRole);
                localStorage.setItem('user', JSON.stringify(data.user));
                alert(`Welcome back, ${data.user.username}!`);
                navigate('/dashboard');
            } else {
                // Specific error handling based on API response message
                if (data.message?.toLowerCase().includes("not found")) {
                    alert("User not available. Please check your email.");
                } else if (data.message?.toLowerCase().includes("password")) {
                    alert("Incorrect password. Please try again.");
                } else {
                    alert(data.message || "Login failed");
                }
            }
        } catch (err) {
            alert("Network error. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-cyan-400 overflow-hidden"
        >
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="w-96 p-6 rounded-xl text-center bg-white/90 backdrop-blur-lg shadow-xl transition-all duration-300"
            >
                <div className="mb-6">
                    <h2 className="m-0 text-2xl text-gray-800 font-bold">🌍 AQI Monitor Login</h2>
                    <p className="text-base text-gray-600">Stay updated with real-time air quality reports</p>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-lg rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-lg rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="mb-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 text-lg font-semibold rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Don't have an account?{' '}</p>
                        <a
                            onClick={() => navigate('/register')}
                            className="text-blue-500 font-bold cursor-pointer"
                        >
                            Register now
                        </a>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default Login;
