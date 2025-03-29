import React, { useState, useEffect } from 'react';
import { AlertOutlined, ClockCircleOutlined, EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons';
import { Card, Spin, Alert, Button, Typography } from 'antd';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

// Define the Alert interface
interface Alert {
    id: number;
    sensorId: number;
    location: string;
    AQIlevel: string;
    alertMessage: string;
    createdAt: string;
}

const AlertsPage: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch alerts from the API
    const fetchAlerts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/alerts');

            if (!response.ok) {
                throw new Error('Failed to fetch alerts');
            }

            const data = await response.json();
            setAlerts(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setAlerts([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch alerts on component mount
    useEffect(() => {
        fetchAlerts();
        const intervalId = setInterval(fetchAlerts, 60000); // Refresh every minute
        return () => clearInterval(intervalId);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}
        >
            <Title level={2}>
                <AlertOutlined style={{ marginRight: 8 }} /> Air Quality Alerts
            </Title>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <Spin size="large" tip="Loading alerts..." />
                </div>
            ) : error ? (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button type="primary" icon={<ReloadOutlined />} onClick={fetchAlerts}>
                            Retry
                        </Button>
                    }
                />
            ) : alerts.length === 0 ? (
                <Alert
                    message="No Alerts"
                    description="There are currently no air quality alerts."
                    type="info"
                    showIcon
                />
            ) : (
                <motion.div
                    className="alerts-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '16px'
                    }}
                >
                    {alerts.map((alert) => {
                        return (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                <Card
                                    bordered
                                    hoverable
                                    style={{
                                        backgroundColor: "#dd9ea4",
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        borderRadius: '8px',
                                    }}
                                >

                                    <Text strong>{alert.alertMessage}</Text>
                                    <div style={{ marginTop: 10 }}>
                                        <Text type="secondary">This alert is related to air quality levels in your area.</Text>
                                    </div>

                                    <div style={{ marginTop: 10 }}>
                                        <ClockCircleOutlined style={{ marginRight: 8 }} />
                                        <Text type="secondary">{alert.createdAt}</Text>
                                    </div>

                                    <div style={{ marginTop: 8 }}>
                                        <EnvironmentOutlined style={{ marginRight: 8 }} />
                                        <Text>{alert.location}</Text>
                                    </div>

                                    <div style={{ marginTop: 8 }}>
                                        <Text type="secondary">Sensor ID: {alert.sensorId}</Text>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
};

export default AlertsPage;
