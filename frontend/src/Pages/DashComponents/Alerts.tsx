import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    AlertOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    FilterOutlined,
    SortAscendingOutlined,
    InfoCircleOutlined,
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons';
import {
    Card,
    Spin,
    Alert,
    Button,
    Typography,
    Space,
    Select,
    Tooltip,
    Statistic,
    Row,
    Col,
    Divider,
    Empty,
    Badge,
    Pagination
} from 'antd';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';

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
    const [isFiltering, setIsFiltering] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [severityFilter, setSeverityFilter] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<string>('newest');
    const [refreshInterval, setRefreshInterval] = useState<number>(60);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(12);
    const [totalAlerts, setTotalAlerts] = useState<number>(0);

    // Fetch alerts with the option to specify pagination parameters
    const fetchAlerts = useCallback(async (page = 1, size = pageSize) => {
        try {
            setIsLoading(true);
            // In a real implementation, you would add pagination params to the API call
            // const response = await fetch(`http://localhost:5000/api/alerts?page=${page}&pageSize=${size}`);
            const response = await fetch('http://localhost:5000/api/alerts');
            if (!response.ok) {
                throw new Error('Failed to fetch alerts');
            }
            const data: AirQualityAlert[] = await response.json();
            setAlerts(data);
            setTotalAlerts(data.length); // In a real API this would come from the response header
            setLastRefreshed(new Date());
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setAlerts([]);
            setTotalAlerts(0);
        } finally {
            setIsLoading(false);
        }
    }, [pageSize]);

    // Debounced filter and sort function to prevent excessive recomputation
    const applyFiltersAndSort = useCallback(
        debounce(() => {
            setIsFiltering(true);

            // Use a web worker for filtering and sorting if available in the environment
            // For now, we'll do it in the main thread but optimized
            const startTime = performance.now();

            let result = [...alerts];

            // Apply location filter
            if (locationFilter !== 'all') {
                result = result.filter(alert => alert.location === locationFilter);
            }

            // Apply severity filter
            if (severityFilter !== 'all') {
                result = result.filter(alert => alert.aqiLevel === severityFilter);
            }

            // Apply sorting - use faster comparison techniques for large datasets
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
            setTotalAlerts(result.length);
            setCurrentPage(1); // Reset to first page when filters change

            const endTime = performance.now();
            console.log(`Filtering took ${endTime - startTime} ms`);

            setIsFiltering(false);
        }, 300),
        [alerts, locationFilter, severityFilter, sortOrder]
    );

    // Apply filters and sorting when dependencies change
    useEffect(() => {
        applyFiltersAndSort();
    }, [alerts, locationFilter, severityFilter, sortOrder, applyFiltersAndSort]);

    // Initial data fetch and refresh interval
    useEffect(() => {
        fetchAlerts();
        const intervalId = setInterval(() => fetchAlerts(), refreshInterval * 1000);
        return () => clearInterval(intervalId);
    }, [fetchAlerts, refreshInterval]);

    // Handle page change
    const handlePageChange = (page: number, pageSize?: number) => {
        setCurrentPage(page);
        if (pageSize) setPageSize(pageSize);
        // In a real application with server-side pagination:
        // fetchAlerts(page, pageSize);
    };

    // Get visible alerts for current page - this is done via computation rather than re-fetching
    const currentAlerts = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAlerts.slice(startIndex, startIndex + pageSize);
    }, [currentPage, pageSize, filteredAlerts]);

    // Get unique locations for filter - memoized to improve performance
    const locations = useMemo(() =>
            [...new Set(alerts.map(alert => alert.location))],
        [alerts]
    );

    // Get unique AQI levels for filter - memoized to improve performance
    const aqiLevels = useMemo(() =>
            [...new Set(alerts.map(alert => alert.aqiLevel))],
        [alerts]
    );

    // Calculate stats - memoized to avoid recalculation
    const stats = useMemo(() => ({
        highestAQI: alerts.length > 0 ? Math.max(...alerts.map(a => a.aqiValue)) : 0,
        criticalAlerts: alerts.filter(a =>
            a.aqiLevel === 'Unhealthy' ||
            a.aqiLevel === 'Very Unhealthy' ||
            a.aqiLevel === 'Hazardous'
        ).length
    }), [alerts]);

    // Motion settings for large datasets - reduced animation complexity
    const cardVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    }), []);

    return (
        <div style={{ padding: '20px', borderRadius: 18, maxWidth: '1200px', margin: '0 auto', background: 'linear-gradient(135deg, #f9f9f9, #e0e0e0)' }}>
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
                                onClick={() => fetchAlerts()}
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
                            value={totalAlerts}
                            prefix={<AlertOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false}>
                        <Statistic
                            title="Critical Alerts"
                            value={stats.criticalAlerts}
                            valueStyle={{ color: stats.criticalAlerts > 0 ? '#cf1322' : undefined }}
                            prefix={<AlertOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false}>
                        <Statistic
                            title="Highest AQI"
                            value={stats.highestAQI}
                            valueStyle={{ color: stats.highestAQI > 150 ? '#cf1322' : stats.highestAQI > 100 ? '#fa8c16' : '#3f8600' }}
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
                        disabled={isLoading || isFiltering}
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
                        disabled={isLoading || isFiltering}
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
                        disabled={isLoading || isFiltering}
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

                {/* Show loading indicator during API fetches */}
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
                            <Button type="primary" icon={<ReloadOutlined />} onClick={() => fetchAlerts()}>
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
                    <>
                        {/* Show loading overlay during filtering operations */}
                        {isFiltering && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Spin tip="Processing filters..." />
                            </div>
                        )}

                        {/* Grid of alerts with optimized rendering */}
                        <div
                            className="alerts-container"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                gap: '16px',
                                position: 'relative'
                            }}
                        >
                            {currentAlerts.map((alert) => (
                                <motion.div
                                    key={alert.id}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    transition={{ duration: 0.3 }}
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
                        </div>

                        {/* Pagination controls */}
                        <Row justify="center" style={{ marginTop: 24 }}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={totalAlerts}
                                onChange={handlePageChange}
                                showSizeChanger
                                pageSizeOptions={['12', '24', '36', '48']}
                                itemRender={(page, type, originalElement) => {
                                    if (type === 'prev') {
                                        return <Button icon={<LeftOutlined />} />;
                                    }
                                    if (type === 'next') {
                                        return <Button icon={<RightOutlined />} />;
                                    }
                                    return originalElement;
                                }}
                                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                            />
                        </Row>
                    </>
                )}
            </Card>
        </div>
    );
};

export default AlertsPage;