import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Paper,
    Typography,
    IconButton,
    Box,
    Divider,
    Badge,
    Stack,
} from "@mui/material";
import { Warning, Notifications, Add, Remove } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

interface Alert {
    id: string;
    sensorId: string;
    AQIlevel: number;
    alertMessage: string;
    location: string;
    createdAt: string;
}

function AlertMessageSection() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [minimized, setMinimized] = useState(false);
    const [newAlert, setNewAlert] = useState(false);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/alerts");
                const newData = response.data.slice(0, 3);

                if (alerts.length > 0 && newData.length > 0 && newData[0].id !== alerts[0].id) {
                    setNewAlert(true);
                    if (minimized) {
                        setTimeout(() => setMinimized(false), 500);
                    }
                }

                setAlerts(newData);
            } catch (error) {
                console.error("Error fetching alerts:", error);
            }
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 10000);
        return () => clearInterval(interval);
    }, [alerts, minimized]);

    useEffect(() => {
        if (!minimized) {
            setNewAlert(false);
        }
    }, [minimized]);

    const toggleMinimize = () => setMinimized(!minimized);

    const getSeverityColor = (aqi: number) => {
        if (aqi > 300) return "#ffebee"; // light red
        if (aqi > 200 && aqi <=300) return "#ffcdd2"; // lighter red
        if (aqi > 100 && aqi <=200) return "#ffe0b2"; // orange
        return "#fff9c4"; // yellow
    };

    const getSeverityBadgeColor = (aqi: number) => {
        if (aqi > 300) return "error";
        if (aqi > 200 && aqi <=300) return "error";
        if (aqi > 100 && aqi <=200) return "warning";
        return "info";
    };

    return (
        <motion.div
            className="fixed bottom-5 right-5 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <motion.div
                animate={{ height: minimized ? 56 : "auto" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <Paper elevation={6} sx={{ width: 320, borderRadius: 2, overflow: "hidden" }}>
                    {/* Header */}
                    <Box
                        onClick={toggleMinimize}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 2,
                            py: 1.5,
                            bgcolor: "error.main",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Badge
                                color="warning"
                                variant="dot"
                                invisible={!newAlert || !minimized}
                                overlap="circular"
                            >
                                <Warning />
                            </Badge>
                            <Typography variant="subtitle2" fontWeight={500}>
                                Air Quality Alerts
                            </Typography>
                        </Stack>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleMinimize();
                            }}
                            sx={{ color: "white" }}
                            aria-label={minimized ? "Expand" : "Minimize"}
                        >
                            {minimized ? <Add /> : <Remove />}
                        </IconButton>
                    </Box>

                    {/* Content */}
                    <AnimatePresence>
                        {!minimized && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Box p={2} maxHeight={300} overflow="auto">
                                    {alerts.length > 0 ? (
                                        <Stack spacing={2}>
                                            {alerts.map((alert) => (
                                                <Paper
                                                    key={alert.id}
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2,
                                                        backgroundColor: getSeverityColor(alert.AQIlevel),
                                                        borderLeft: `4px solid`,
                                                        borderColor: (theme) =>
                                                            theme.palette[getSeverityBadgeColor(alert.AQIlevel)].main,
                                                    }}
                                                >
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="body2" fontWeight="bold">
                                                            Sensor {alert.sensorId}
                                                        </Typography>
                                                        <Box
                                                            px={1}
                                                            py={0.5}
                                                            borderRadius={1}
                                                            bgcolor={`${getSeverityBadgeColor(alert.AQIlevel)}.main`}
                                                            color="white"
                                                            fontSize="12px"
                                                            fontWeight={600}
                                                        >
                                                            AQI {alert.AQIlevel}
                                                        </Box>
                                                    </Stack>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {alert.location}
                                                    </Typography>
                                                    <Typography variant="body2" mt={1}>
                                                        {alert.alertMessage}
                                                    </Typography>
                                                    <Divider sx={{ my: 1 }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(alert.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </Typography>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                                            <Notifications sx={{ fontSize: 36, color: "error.light", mb: 1 }} />
                                            <Typography variant="subtitle2">No active alerts</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Air quality is within normal parameters
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Paper>
            </motion.div>
        </motion.div>
    );
}

export default AlertMessageSection;
