import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TextField, Button, Typography, Card, Box } from '@mui/material';

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
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Image */}
            <div 
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(14, 165, 233, 0.7)',
                    backdropFilter: 'blur(4px)',
                }}/>
            </div>

            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ position: 'relative', zIndex: 1 }}
            >
                <Card sx={{ p: 4, width: 400, borderRadius: 3, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', boxShadow: 3 }}>
                    <Box mb={3}>
                        <Typography variant="h5" fontWeight="bold" color="primary">AQI Monitor</Typography>
                        <Typography variant="body2" color="textSecondary">Stay updated with real-time air quality reports</Typography>
                    </Box>
                    <form onSubmit={onSubmit}>
                        <Box mb={2}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Box>
                        <Box mb={2}>
                            <TextField
                                fullWidth
                                type="password"
                                label="Password"
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Box>
                        <Box mb={2}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                            Don't have an account?{' '}
                            <Typography
                                component="span"
                                color="primary"
                                fontWeight="bold"
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate('/register')}
                            >
                                Register now
                            </Typography>
                        </Typography>
                    </form>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default Login;
