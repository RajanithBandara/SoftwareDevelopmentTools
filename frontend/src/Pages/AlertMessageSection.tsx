import React, { useEffect, useState } from "react";
import axios from "axios";
import { MinusOutlined, PlusOutlined, BellOutlined, WarningOutlined } from "@ant-design/icons";
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

                // Detect new alert
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
        if (aqi > 300) return "bg-red-50 border-red-300";
        if (aqi > 200) return "bg-red-50 border-red-200";
        if (aqi > 100) return "bg-orange-50 border-orange-200";
        return "bg-yellow-50 border-yellow-200";
    };

    const getSeverityBadge = (aqi: number) => {
        if (aqi > 300) return "bg-red-600 text-white";
        if (aqi > 200) return "bg-red-500 text-white";
        if (aqi > 100) return "bg-orange-500 text-white";
        return "bg-yellow-500 text-white";
    };

    return (
        <motion.div
            className="fixed bottom-5 right-5 z-50 rounded-xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <motion.div
                className="bg-white border border-gray-200 w-80 rounded-xl overflow-hidden"
                animate={{ height: minimized ? "44px" : "auto" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {/* Header */}
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
                                        className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-300 rounded-full"
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                        <h3 className="text-sm font-medium">Air Quality Alerts</h3>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleMinimize();
                        }}
                        className="hover:bg-white/10 p-1 rounded"
                        aria-label={minimized ? "Expand" : "Minimize"}
                    >
                        {minimized ? <PlusOutlined /> : <MinusOutlined />}
                    </button>
                </div>

                {/* Content */}
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
                                            className={`p-3 border rounded-lg ${getSeverityColor(alert.AQIlevel)}`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                                    <span className="text-sm font-semibold text-gray-800">
                            Sensor {alert.sensorId}
                          </span>
                                                </div>
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityBadge(
                                                        alert.AQIlevel
                                                    )}`}
                                                >
                          AQI {alert.AQIlevel}
                        </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{alert.location}</p>
                                            <p className="text-sm mt-1 text-gray-700">{alert.alertMessage}</p>
                                            <div className="text-xs text-gray-400 mt-2 border-t pt-1">
                                                {new Date(alert.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <div className="bg-red-100 p-3 rounded-full mb-2">
                                        <BellOutlined className="text-xl text-red-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">No active alerts</p>
                                    <p className="text-xs text-gray-400">
                                        Air quality is within normal parameters
                                    </p>
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
