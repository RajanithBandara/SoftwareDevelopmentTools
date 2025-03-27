import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button, TextField, Box, Card, CircularProgress, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
    const navigate = useNavigate();

    const onSubmit = async (data: LoginFormData) => {
        setMessage(null);
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/users/login', {
                email: data.email,
                password: data.password,
            });

            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);  // Store token for authentication
                localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user info
                setMessage('✅ Login successful!');
                setTimeout(() => navigate('/dashboard'), 1000);
            }
        } catch (error: any) {
            // Extract error message robustly from response
            let errorMsg = 'Invalid credentials';
            if (error.response) {
                if (typeof error.response.data === 'string') {
                    errorMsg = error.response.data;
                } else if (error.response.data.message) {
                    errorMsg = error.response.data.message;
                }
            }
            setMessage(`❌ Login failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ width: '100%', maxWidth: '400px' }}
            >
                <Card sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
                    {message && (
                        <Typography variant="body2" color={message.startsWith('✅') ? 'success.main' : 'error'} align="center" gutterBottom>
                            {message}
                        </Typography>
                    )}
                    <motion.form
                        onSubmit={handleSubmit(onSubmit)}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                        <Controller
                            name="email"
                            control={control}
                            rules={{ required: "Email is required" }}
                            render={({ field }) => (
                                <TextField {...field} label="Email" variant="outlined" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                            )}
                        />

                        <Controller
                            name="password"
                            control={control}
                            rules={{ required: "Password is required" }}
                            render={({ field }) => (
                                <TextField {...field} label="Password" variant="outlined" fullWidth type="password" error={!!errors.password} helperText={errors.password?.message} />
                            )}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            color="primary"
                            disabled={loading}
                            sx={{ padding: '0.8rem', bgcolor: 'black', '&:hover': { bgcolor: 'gray' } }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                        </Button>

                        <Typography variant="body2" align="center" mt={2}>
                            Don't have an account?{' '}
                            <Button color="primary" onClick={() => navigate('/register')} sx={{ textTransform: 'none' }}>
                                Register Here
                            </Button>
                        </Typography>
                    </motion.form>
                </Card>
            </motion.div>
        </Box>
    );
};

export default Login;
