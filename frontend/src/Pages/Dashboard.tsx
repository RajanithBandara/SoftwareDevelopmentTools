import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button, CircularProgress } from "@mui/material";

const Dashboard: React.FC = () => {
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get("http://localhost:5000/api/students/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUserInfo(response.data);
            } catch (error) {
                console.error("Error fetching user info:", error);
                localStorage.removeItem("token");
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const handleLogin = () => navigate("/login");
    const handleLogout = () => {
        localStorage.removeItem("token");
        setUserInfo(null);
        navigate("/login");
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
            bgcolor="#1e1e1e"
        >
            <Card sx={{ width: 400, p: 3, backgroundColor: "#2c2c2c", color: "#fff" }}>
                <CardContent>
                    {userInfo ? (
                        <>
                            <Typography variant="h5" gutterBottom>
                                Welcome, {userInfo.name}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Email:</strong> {userInfo.email}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Degree Program:</strong> {userInfo.degreeProgram}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Age:</strong> {userInfo.age}
                            </Typography>
                            <Box mt={2} display="flex" justifyContent="center">
                                <Button variant="contained" color="secondary" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" textAlign="center">
                                You need to log in first.
                            </Typography>
                            <Box mt={2} display="flex" justifyContent="center">
                                <Button variant="contained" color="primary" onClick={handleLogin}>
                                    Login
                                </Button>
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default Dashboard;
