import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    TextField,
    Button,
    Typography,
    Card,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
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
                background: 'linear-gradient(135deg, #87CEEB, #4682B4)',
            }}
        >
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <Card sx={{ p: 4, width: 400, borderRadius: 3, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', boxShadow: 3 }}>
                    <Box mb={3}>
                        <Typography variant="h5" fontWeight="bold" color="primary">AQI Monitor</Typography>
                        <Typography variant="body2" color="textSecondary">Stay updated with real-time air quality reports</Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={onSubmit} noValidate>
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
                                startIcon={loading && <CircularProgress size={20} color="inherit" />}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </Box>
                    </form>

                    <Typography variant="body2" color="textSecondary">
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#1976d2', fontWeight: 'bold', textDecoration: 'none' }}>
                            Register now
                        </Link>
                    </Typography>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default Login;
