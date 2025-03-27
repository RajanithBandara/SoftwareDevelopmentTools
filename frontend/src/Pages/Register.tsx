import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button, TextField, Box, Card, CircularProgress, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

interface FormData {
    name: string;
    email: string;
    role: string;
    password: string;
}

const Register: React.FC = () => {
    const [backendStatus, setBackendStatus] = useState<boolean | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

    useEffect(() => {
        const checkBackendConnection = async () => {
            try {
                await axios.get('http://localhost:5000/api/health');
                setBackendStatus(true);
            } catch {
                setBackendStatus(false);
            }
        };
        checkBackendConnection();
    }, []);

    const onSubmit = async (data: FormData) => {
        setMessage(null);
        try {
            // POST to the updated Users API endpoint
            const response = await axios.post('http://localhost:5000/api/users/register', data);
            if (response.status === 201) {
                setMessage('✅ Registration successful!');
            }
        } catch (error: any) {
            setMessage('❌ Registration failed: ' + (error.response?.data || error.message));
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: '400px' }}>
                <Card sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
                    {backendStatus !== null && (
                        <Typography variant="body2" color={backendStatus ? 'green' : 'error'} align="center" gutterBottom>
                            {backendStatus ? '✅ Connected' : '❌ Not Connected'}
                        </Typography>
                    )}
                    {message && (
                        <Typography variant="body2" color="error" align="center" gutterBottom>
                            {message}
                        </Typography>
                    )}
                    <motion.form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: "Full Name is required", minLength: { value: 3, message: "Name must be at least 3 characters" } }}
                            render={({ field }) => (
                                <TextField {...field} label="Full Name" variant="outlined" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                            )}
                        />
                        <Controller
                            name="email"
                            control={control}
                            rules={{ required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" } }}
                            render={({ field }) => (
                                <TextField {...field} label="Email" variant="outlined" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                            )}
                        />
                        <Controller
                            name="role"
                            control={control}
                            rules={{ required: "Role is required" }}
                            render={({ field }) => (
                                <TextField {...field} label="Role" variant="outlined" fullWidth error={!!errors.role} helperText={errors.role?.message} />
                            )}
                        />
                        <Controller
                            name="password"
                            control={control}
                            rules={{ required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } }}
                            render={({ field }) => (
                                <TextField {...field} label="Password" variant="outlined" fullWidth type="password" error={!!errors.password} helperText={errors.password?.message} />
                            )}
                        />
                        <Button type="submit" variant="contained" fullWidth color="primary" sx={{ padding: '0.8rem', bgcolor: 'black', '&:hover': { bgcolor: 'gray' } }} disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                        </Button>
                        <Button variant="outlined" fullWidth color="secondary" sx={{ padding: '0.8rem' }} onClick={() => navigate('/login')}>
                            Login Here
                        </Button>
                    </motion.form>
                </Card>
            </motion.div>
        </Box>
    );
};

export default Register;
