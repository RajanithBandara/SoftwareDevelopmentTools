import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Table, Spin, message, Typography, Tooltip } from "antd";
import {
    EnvironmentOutlined,
    AlertOutlined,
    HeartOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DownOutlined,
    RightOutlined,
    LineChartOutlined
} from "@ant-design/icons";
import { MdOutlineSensors } from "react-icons/md";
import axios from "axios";
import moment from "moment";

const { Text } = Typography;

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
};

const pageTransition = {
    type: "spring",
    stiffness: 120,
    damping: 15,
};

const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
};

// Animation variants for the expanded content
const expandVariants = {
    hidden: {
        opacity: 0,
        height: 0,
        margin: 0,
        overflow: "hidden"
    },
    visible: {
        opacity: 1,
        height: "auto",
        margin: "12px 0",
        transition: {
            height: {
                duration: 0.3
            },
            opacity: {
                duration: 0.25,
                delay: 0.15
            }
        }
    },
    exit: {
        opacity: 0,
        height: 0,
        margin: 0,
        transition: {
            height: {
                duration: 0.3
            },
            opacity: {
                duration: 0.15
            }
        }
    }
};

// Animation variants for the expand button
const buttonVariants = {
    initial: { rotate: 0 },
    expanded: { rotate: 90 }
};

const DashboardHome = () => {
    const [stats, setStats] = useState({
        sensorCount: null,
        alertCount: null,
        readingCount: null,
        lastUpdated: null
    });
    const [sensorReadings, setSensorReadings] = useState([]);
    const [healthStatus, setHealthStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const [
                sensorRes,
                alertRes,
                readingRes,
                healthRes,
                latestReadingsRes
            ] = await Promise.all([
                axios.get("http://localhost:5000/api/stats/sensors-count"),
                axios.get("http://localhost:5000/api/stats/alerts-count"),
                axios.get("http://localhost:5000/api/stats/reading-count"),
                axios.get("http://localhost:5000/api/health-status"),
                axios.get("http://localhost:5000/api/sensors/latest-readings")
            ]);

            setStats({
                sensorCount: sensorRes.data.sensorCount,
                alertCount: alertRes.data.alertCount,
                readingCount: readingRes.data.readingCount,
                lastUpdated: new Date().toLocaleTimeString()
            });
            setHealthStatus(healthRes.data.status);
            setSensorReadings(latestReadingsRes.data);
        } catch (error) {
            message.error("Failed to load dashboard data");
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const refreshInterval = setInterval(fetchStats, 5 * 60 * 1000);
        return () => clearInterval(refreshInterval);
    }, [fetchStats]);

    // Custom component to replace the standard expandedRowRender
    const ExpandedContent = ({ record }) => {
        return (
            <AnimatePresence>
                <motion.div
                    key={record.sensorId}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={expandVariants}
                    className="bg-gray-50 p-4 rounded-lg mx-4"
                >
                    <div className="flex items-center mb-3">
                        <LineChartOutlined className="text-blue-500 mr-2" />
                        <Text strong>Sensor Reading History</Text>
                    </div>
                    <Table
                        columns={[
                            {
                                title: "AQI Value",
                                dataIndex: "aqiValue",
                                key: "aqiValue",
                                sorter: (a, b) => a.aqiValue - b.aqiValue,
                                render: (value) => {
                                    let color = "green";
                                    if (value > 100) color = "orange";
                                    if (value > 150) color = "red";
                                    return <Text style={{ color }}>{value}</Text>;
                                }
                            },
                            {
                                title: "Recorded At",
                                dataIndex: "recordedAt",
                                key: "recordedAt",
                                render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss")
                            }
                        ]}
                        dataSource={record.readings}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        className="expanded-table"
                    />
                </motion.div>
            </AnimatePresence>
        );
    };

    const toggleExpand = (expanded, record) => {
        setExpandedRowKeys(expanded ? [record.sensorId] : []);
    };

    // Custom expand icon with animation
    const expandIcon = ({ expanded, onExpand, record }) => {
        return (
            <Tooltip title={expanded ? "Hide details" : "View sensor readings"}>
                <motion.button
                    className="bg-blue-50 hover:bg-blue-100 rounded-full p-1 transition-colors duration-200"
                    onClick={e => {
                        onExpand(record, e);
                    }}
                    style={{ border: "1px solid #e6f7ff" }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <motion.span
                        animate={expanded ? "expanded" : "initial"}
                        variants={buttonVariants}
                        transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
                        style={{ display: "block" }}
                    >
                        <RightOutlined style={{ color: "#1677ff" }} />
                    </motion.span>
                </motion.button>
            </Tooltip>
        );
    };

    const columns = [
        {
            title: "Sensor ID",
            dataIndex: "sensorId",
            key: "sensorId",
            render: (id) => <Text strong>{id}</Text>
        },
        {
            title: "Location",
            dataIndex: "location",
            key: "location",
            render: (location) => (
                <div className="flex items-center">
                    <EnvironmentOutlined className="mr-1 text-blue-500" />
                    <span>{location}</span>
                </div>
            )
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (status) => (
                status === true ?
                    <Tooltip title="Online">
                        <CheckCircleOutlined style={{ fontSize: "18px", color: "#52c41a" }} />
                    </Tooltip> :
                    <Tooltip title="Offline">
                        <CloseCircleOutlined style={{ fontSize: "18px", color: "#ff4d4f" }} />
                    </Tooltip>
            )
        },
        {
            title: "Latest Reading",
            dataIndex: "readings",
            key: "latestReading",
            render: (readings) => {
                if (!readings || readings.length === 0) return "-";
                const latest = readings[0];
                let color = "green";
                if (latest.aqiValue > 100) color = "orange";
                if (latest.aqiValue > 150) color = "red";
                return <Text style={{ color }}>{latest.aqiValue}</Text>;
            }
        }
    ];

    const StatCard = ({ title, value, icon, color, trend }) => (
        <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.3 }}
        >
            <Card
                className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4"
                style={{ borderLeftColor: color }}
                bordered={false}
            >
                {loading ? (
                    <div className="flex justify-center items-center h-24">
                        <Spin size="large" />
                    </div>
                ) : (
                    <div className="p-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-500 font-medium">{title}</h3>
                            <div className="text-2xl" style={{ color }}>{icon}</div>
                        </div>
                        <div className="flex items-baseline">
                            <span className="text-3xl font-bold">{value ?? 0}</span>
                            {trend && (
                                <span className={`ml-2 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {trend > 0 ? `+${trend}%` : `${trend}%`}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </motion.div>
    );

    // Custom implementation for the Table to handle the animation
    const CustomExpandableTable = () => (
        <Table
            columns={columns}
            dataSource={sensorReadings}
            rowKey="sensorId"
            pagination={false}
            expandIcon={expandIcon}
            expandedRowKeys={expandedRowKeys}
            onExpand={toggleExpand}
            expandable={{
                expandedRowKeys,
                onExpandedRowsChange: (expandedRows) => {
                    setExpandedRowKeys(expandedRows);
                }
            }}
            components={{
                body: {
                    row: (props) => {
                        const { children, ...restProps } = props;
                        const rowId = props['data-row-key'];
                        const isExpanded = expandedRowKeys.includes(rowId);

                        // Create two rows: the main row and a custom expansion row
                        return (
                            <>
                                <tr {...restProps}>{children}</tr>
                                {isExpanded && (
                                    <tr className="ant-table-expanded-row">
                                        <td colSpan={columns.length}>
                                            <ExpandedContent record={sensorReadings.find(item => item.sensorId === rowId)} />
                                        </td>
                                    </tr>
                                )}
                            </>
                        );
                    }
                }
            }}
        />
    );

    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="p-6 max-w-7xl mx-auto"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>
                <div className="flex items-center space-x-4">
                    {!loading && stats.lastUpdated && (
                        <span className="text-sm text-gray-500">
                            Last updated: {stats.lastUpdated}
                        </span>
                    )}
                    <motion.button
                        onClick={fetchStats}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Refresh
                    </motion.button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Sensors"
                    value={stats.sensorCount}
                    icon={<EnvironmentOutlined />}
                    color="#1677ff"
                    trend={2.5}
                />
                <StatCard
                    title="Active Alerts"
                    value={stats.alertCount}
                    icon={<AlertOutlined />}
                    color="#ff4d4f"
                    trend={-5.3}
                />
                <StatCard
                    title="Total Readings"
                    value={stats.readingCount}
                    icon={<MdOutlineSensors />}
                    color="#52c41a"
                    trend={12.7}
                />
                <StatCard
                    title="System Health"
                    value={healthStatus ?? "Unknown"}
                    icon={<HeartOutlined />}
                    color={healthStatus === "Healthy" ? "#52c41a" : "#ff4d4f"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card
                    title={
                        <div className="flex items-center">
                            <MdOutlineSensors className="mr-2 text-blue-500" size={18} />
                            <span>Sensor Readings</span>
                        </div>
                    }
                    className="rounded-xl shadow-lg"
                >
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <CustomExpandableTable />
                    )}
                </Card>

                <Card
                    title={
                        <div className="flex items-center">
                            <HeartOutlined className="mr-2 text-blue-500" />
                            <span>System Health Details</span>
                        </div>
                    }
                    className="rounded-xl shadow-lg"
                >
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <motion.div
                            className="h-64 flex flex-col items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.div
                                className={`text-6xl mb-4 ${healthStatus === "Healthy" ? "text-green-500" : "text-red-500"}`}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20
                                }}
                            >
                                {healthStatus === "Healthy" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                            </motion.div>
                            <Text className="text-xl text-gray-500">
                                System is currently {healthStatus === "Healthy" ? (
                                <span className="text-green-500 font-medium">running smoothly</span>
                            ) : (
                                <span className="text-red-500 font-medium">experiencing issues</span>
                            )}
                            </Text>
                        </motion.div>
                    )}
                </Card>
            </div>

            <style jsx>{`
                .expanded-table {
                    border-radius: 8px;
                    overflow: hidden;
                }
                .expanded-table .ant-table-thead > tr > th {
                    background-color: #f0f5ff;
                }
                .ant-table-expanded-row td {
                    padding: 0 !important;
                    background: transparent !important;
                    border-bottom: none !important;
                }
            `}</style>
        </motion.div>
    );
};

export default DashboardHome;