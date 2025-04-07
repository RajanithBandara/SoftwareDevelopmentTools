import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "antd";
import { MessageOutlined, MinusOutlined, PlusOutlined, BellOutlined, WarningOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

function AlertMessageSection() {
    const [alerts, setAlerts] = useState([]);
    const [minimized, setMinimized] = useState(false);
    const [newAlert, setNewAlert] = useState(false);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/alerts");

                // Check if there's a new alert
                if (alerts.length > 0 && response.data.length > 0 &&
                    response.data[0].id !== alerts[0].id) {
                    setNewAlert(true);
                    // Auto-expand if minimized when new alert arrives
                    if (minimized) {
                        setTimeout(() => setMinimized(false), 500);
                    }
                }

                setAlerts(response.data.slice(0, 3)); // Fetch latest 3 alerts
            } catch (error) {
                console.error("Error fetching alerts:", error);
            }
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 10000); // Refresh every 10 sec
        return () => clearInterval(interval);
    }, [alerts, minimized]);

    // Reset new alert notification when expanding
    useEffect(() => {
        if (!minimized) {
            setNewAlert(false);
        }
    }, [minimized]);

    const toggleMinimize = () => {
        setMinimized(!minimized);
    };

    const getSeverityColor = (aqi) => {
        if (aqi > 300) return "bg-red-50 border-red-300";
        if (aqi > 200) return "bg-red-50 border-red-200";
        if (aqi > 100) return "bg-orange-50 border-orange-200";
        return "bg-yellow-50 border-yellow-200";
    };

    const getSeverityBadge = (aqi) => {
        if (aqi > 300) return "bg-red-600 text-white";
        if (aqi > 200) return "bg-red-500 text-white";
        if (aqi > 100) return "bg-orange-500 text-white";
        return "bg-yellow-500 text-white";
    };

    return (
        <motion.div
            className="fixed bottom-5 right-5 z-40 rounded-lg overflow-hidden shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <motion.div
                className={`bg-white rounded-lg border border-gray-200 w-80 overflow-hidden`}
                animate={{
                    height: minimized ? "44px" : "auto",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {/* Header bar with minimize button */}
                <div
                    className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white cursor-pointer"
                    onClick={toggleMinimize}
                >
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <WarningOutlined className="text-lg" />
                            <AnimatePresence>
                                {newAlert && minimized && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full"
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                        <h3 className="text-base font-semibold">Air Quality Alerts</h3>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleMinimize();
                        }}
                        className="hover:bg-red-300 hover:bg-opacity-20 rounded p-1 transition-colors"
                        aria-label={minimized ? "Expand" : "Minimize"}
                    >
                        {minimized ? <PlusOutlined /> : <MinusOutlined />}
                    </button>
                </div>

                {/* Content area */}
                <AnimatePresence>
                    {!minimized && (
                        <motion.div
                            className="p-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {alerts.length > 0 ? (
                                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                    {alerts.map((alert) => (
                                        <motion.div
                                            key={alert.id}
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className={`rounded-lg p-3 border ${getSeverityColor(alert.AQIlevel)}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                    <p className="text-sm font-bold text-gray-800">Sensor {alert.sensorId}</p>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityBadge(alert.AQIlevel)}`}>
                                                    AQI {alert.AQIlevel}
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-gray-500 mt-1">{alert.location}</p>
                                            <p className="text-sm mt-2 text-gray-700">{alert.alertMessage}</p>
                                            <div className="flex justify-between items-center mt-3 pt-1 border-t border-gray-100">
                                                <p className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="bg-red-50 p-3 rounded-full mb-2">
                                        <BellOutlined className="text-xl text-red-400"/>
                                    </div>
                                    <p className="text-sm text-gray-600">No active air quality alerts</p>
                                    <p className="text-xs text-gray-400 mt-1">Air quality is within normal parameters</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}

export default AlertMessageSection;