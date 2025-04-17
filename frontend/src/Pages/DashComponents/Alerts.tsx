import React, { useEffect, useState } from 'react';
import {
    AlertOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    ReloadOutlined,
    FilterOutlined,
    SortAscendingOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import {
    Card,
    Spin,
    Alert,
    Button,
    Typography,
    Tag,
    Space,
    Select,
    Tooltip,
    Statistic,
    Row,
    Col,
    Divider,
    Empty,
    Badge
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;

// Define the Alert interface
interface AirQualityAlert {
    id: number;
    sensorId: number;
    location: string;
    aqiValue: number;
    aqiLevel: string;
    alertMessage: string;
    createdAt: string;
}

// Function to choose AQI tag color
const getTagColor = (aqiLevel: string): string => {
    switch (aqiLevel) {
        case 'Good': return 'green';
        case 'Moderate': return 'gold';
        case 'Unhealthy for Sensitive Groups': return 'orange';
        case 'Unhealthy': return 'red';
        case 'Very Unhealthy': return 'magenta';
        case 'Hazardous': return 'volcano';
        default: return 'default';
    }
};

// Function to get recommendations based on AQI level
const getRecommendations = (aqiLevel: string): string => {
    switch (aqiLevel) {
        case 'Good':
            return 'Air quality is satisfactory. Outdoor activities are safe for most people.';
        case 'Moderate':
            return 'Air quality is acceptable. Consider reducing prolonged outdoor exertion for sensitive groups.';
        case 'Unhealthy for Sensitive Groups':
            return 'Members of sensitive groups may experience health effects. General public is less likely to be affected.';
        case 'Unhealthy':
            return 'Everyone may begin to experience health effects. Sensitive groups should limit outdoor activities.';
        case 'Very Unhealthy':
            return 'Health alert: everyone may experience more serious health effects. Avoid outdoor activities.';
        case 'Hazardous':
            return 'Health warning of emergency conditions. Entire population is likely to be affected. Stay indoors.';
        default:
            return 'No specific recommendations available.';
    }
};

const AlertsPage: React.FC = () => {
    const [alerts, setAlerts] = useState<AirQualityAlert[]>([]);
    const [filteredAlerts, setFilteredAlerts] = useState<AirQualityAlert[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [severityFilter, setSeverityFilter] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<string>('newest');
    const [refreshInterval, setRefreshInterval] = useState<number>(60);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    const fetchAlerts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/alerts');
            if (!response.ok) {
                throw new Error('Failed to fetch alerts');
            }
            const data: AirQualityAlert[] = await response.json();
            setAlerts(data);
            setLastRefreshed(new Date());
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setAlerts([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Apply filters and sorting
    useEffect(() => {
        let result = [...alerts];

        // Apply location filter
        if (locationFilter !== 'all') {
            result = result.filter(alert => alert.location === locationFilter);
        }

        // Apply severity filter
        if (severityFilter !== 'all') {
            result = result.filter(alert => alert.aqiLevel === severityFilter);
        }

        // Apply sorting
        if (sortOrder === 'newest') {
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortOrder === 'oldest') {
            result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else if (sortOrder === 'highest') {
            result.sort((a, b) => b.aqiValue - a.aqiValue);
        } else if (sortOrder === 'lowest') {
            result.sort((a, b) => a.aqiValue - b.aqiValue);
        }

        setFilteredAlerts(result);
    }, [alerts, locationFilter, severityFilter, sortOrder]);

    // Initial data fetch and refresh interval
    useEffect(() => {
        fetchAlerts();
        const intervalId = setInterval(fetchAlerts, refreshInterval * 1000);
        return () => clearInterval(intervalId);
    }, [refreshInterval]);

    // Get unique locations for filter
    const locations = [...new Set(alerts.map(alert => alert.location))];

    // Get unique AQI levels for filter
    const aqiLevels = [...new Set(alerts.map(alert => alert.aqiLevel))];

    // Calculate stats
    const highestAQI = alerts.length > 0 ? Math.max(...alerts.map(a => a.aqiValue)) : 0;
    const criticalAlerts = alerts.filter(a =>
        a.aqiLevel === 'Unhealthy' ||
        a.aqiLevel === 'Very Unhealthy' ||
        a.aqiLevel === 'Hazardous'
    ).length;

    // Visual improvements: introduce a subtle background gradient and adjust spacing
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{ padding: '20px', borderRadius: 18, boxShadow: 'initial', maxWidth: '1200px', margin: '0 auto', background: 'linear-gradient(135deg, #f9f9f9, #e0e0e0)' }}
        >
            <Row gutter={[16, 16]} align="middle" justify="space-between">
                <Col>
                    <Title level={2} style={{ margin: 0 }}>
                        <AlertOutlined style={{ marginRight: 12, color: '#1890ff' }} />
                        Air Quality Alerts Dashboard
                    </Title>
                </Col>
                <Col>
                    <Space>
                        <Text type="secondary">
                            Last updated: {lastRefreshed.toLocaleTimeString()}
                        </Text>
                        <Tooltip title="Refresh data now">
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={fetchAlerts}
                                loading={isLoading}
                            >
                                Refresh
                            </Button>
                        </Tooltip>
                    </Space>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false}>
                        <Statistic
                            title="Total Alerts"
                            value={alerts.length}
                            prefix={<AlertOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false}>
                        <Statistic
                            title="Critical Alerts"
                            value={criticalAlerts}
                            valueStyle={{ color: criticalAlerts > 0 ? '#cf1322' : undefined }}
                            prefix={<AlertOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false}>
                        <Statistic
                            title="Highest AQI"
                            value={highestAQI}
                            valueStyle={{ color: highestAQI > 150 ? '#cf1322' : highestAQI > 100 ? '#fa8c16' : '#3f8600' }}
                            prefix={<InfoCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginTop: 16 }}>
                <Space wrap style={{ marginBottom: 16 }}>
                    <Select
                        style={{ width: 180 }}
                        placeholder="Filter by location"
                        onChange={value => setLocationFilter(value)}
                        value={locationFilter}
                        suffixIcon={<FilterOutlined />}
                        disabled={isLoading}
                    >
                        <Option value="all">All Locations</Option>
                        {locations.map(location => (
                            <Option key={location} value={location}>{location}</Option>
                        ))}
                    </Select>

                    <Select
                        style={{ width: 200 }}
                        placeholder="Filter by severity"
                        onChange={value => setSeverityFilter(value)}
                        value={severityFilter}
                        suffixIcon={<FilterOutlined />}
                        disabled={isLoading}
                    >
                        <Option value="all">All Severity Levels</Option>
                        {aqiLevels.map(level => (
                            <Option key={level} value={level}>{level}</Option>
                        ))}
                    </Select>

                    <Select
                        style={{ width: 150 }}
                        placeholder="Sort by"
                        onChange={value => setSortOrder(value)}
                        value={sortOrder}
                        suffixIcon={<SortAscendingOutlined />}
                        disabled={isLoading}
                    >
                        <Option value="newest">Newest First</Option>
                        <Option value="oldest">Oldest First</Option>
                        <Option value="highest">Highest AQI</Option>
                        <Option value="lowest">Lowest AQI</Option>
                    </Select>

                    <Select
                        style={{ width: 180 }}
                        placeholder="Refresh interval"
                        onChange={value => setRefreshInterval(Number(value))}
                        value={refreshInterval.toString()}
                        disabled={isLoading}
                    >
                        <Option value="30">Every 30 seconds</Option>
                        <Option value="60">Every 1 minute</Option>
                        <Option value="300">Every 5 minutes</Option>
                        <Option value="600">Every 10 minutes</Option>
                    </Select>
                </Space>

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
                ) : filteredAlerts.length === 0 ? (
                    <Empty
                        description={
                            alerts.length > 0
                                ? "No alerts match your current filters"
                                : "There are currently no air quality alerts"
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <AnimatePresence>
                        <motion.div
                            className="alerts-container"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                gap: '16px'
                            }}
                        >
                            {filteredAlerts.map((alert) => (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    layout
                                >
                                    <Badge.Ribbon
                                        text={alert.aqiLevel}
                                        color={getTagColor(alert.aqiLevel)}
                                    >
                                        <Card
                                            hoverable
                                            style={{
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                borderRadius: '12px',
                                                height: '100%',
                                                transition: 'transform 0.3s',
                                            }}
                                            actions={[
                                                <Tooltip title="View sensor details" key="details">
                                                    <Button type="text" icon={<InfoCircleOutlined />}>Sensor #{alert.sensorId}</Button>
                                                </Tooltip>
                                            ]}
                                        >
                                            <div style={{ marginBottom: 12 }}>
                                                <Title level={4} style={{ margin: 0 }}>{alert.location}</Title>
                                                <Text type="secondary">
                                                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                                                    {new Date(alert.createdAt).toLocaleString()}
                                                </Text>
                                            </div>

                                            <Row gutter={16} align="middle">
                                                <Col>
                                                    <Statistic
                                                        title="AQI Value"
                                                        value={alert.aqiValue}
                                                        valueStyle={{
                                                            color: alert.aqiValue > 150 ? '#cf1322' :
                                                                alert.aqiValue > 100 ? '#fa8c16' :
                                                                    alert.aqiValue > 50 ? '#faad14' : '#3f8600'
                                                        }}
                                                    />
                                                </Col>
                                                <Col>
                                                    <div style={{ height: '100%' }}>
                                                        <Text strong>{alert.alertMessage}</Text>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Divider style={{ margin: '12px 0' }} />

                                            <div>
                                                <Text type="secondary" italic>Recommendation:</Text>
                                                <div style={{ marginTop: 4 }}>
                                                    <Text>{getRecommendations(alert.aqiLevel)}</Text>
                                                </div>
                                            </div>
                                        </Card>
                                    </Badge.Ribbon>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </Card>
        </motion.div>
    );
};

export default AlertsPage;
