import React, { useState, useEffect } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, CloudOutlined } from "@ant-design/icons";
import { FaMapMarked, FaCloudSun } from "react-icons/fa";
import { MdOutlineCrisisAlert, MdHistory } from "react-icons/md";
import { IoHome, IoSettingsSharp } from "react-icons/io5";
import { Button, Layout, Menu, Avatar, Tooltip, Typography, Badge } from "antd";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import DashboardHome from "./DashComponents/Home";
import MapView from "./DashComponents/MapView";
import HistoricalData from "./DashComponents/HistoricData";
import AlertsPage from "./DashComponents/Alerts";
import SensorManagement from "./DashComponents/Settings.tsx";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const colors = {
    primary: "#1890ff", // Sky blue
    secondary: "#52c41a", // Green for healthy status
    warning: "#faad14", // Yellow for warnings
    danger: "#f5222d", // Red for alerts/danger
    background: "#f0f8ff", // Light blue background
    textPrimary: "#262626", // Dark text
    textSecondary: "#8c8c8c", // Secondary text
    borderColor: "#d9e8f6", // Light blue border
};

// Time-based theme colors
const timeThemes = {
    morning: {
        gradient: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
        siderBg: "#e1eeff",
        primaryText: "#2a5298",
        borderColor: "#c0d8f7",
        iconColor: "#4a7fcb"
    },
    midday: {
        gradient: "linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)",
        siderBg: "#e0f5ff",
        primaryText: "#0077cc",
        borderColor: "#b8e7ff",
        iconColor: "#0086e6"
    },
    evening: {
        gradient: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
        siderBg: "#fff0e0",
        primaryText: "#e67700",
        borderColor: "#ffe0c0",
        iconColor: "#ff8c38"
    },
    night: {
        gradient: "linear-gradient(120deg, #4b6cb7 0%, #182848 100%)",
        siderBg: "#d6e0f5",
        primaryText: "#1a377c",
        borderColor: "#c3d0ea",
        iconColor: "#3a5fad"
    }
};

const Dashboard: React.FC = () => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [alertCount, ] = useState<number>(null); // Mock alert count
    const [currentTheme, setCurrentTheme] = useState(timeThemes.midday);

    const navigate = useNavigate();

    // Get current time-based theme
    const getCurrentTimeTheme = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 10) {
            return timeThemes.morning;
        } else if (hour >= 10 && hour < 16) {
            return timeThemes.midday;
        } else if (hour >= 16 && hour < 18) {
            return timeThemes.evening;
        } else {
            return timeThemes.night;
        }
    };

    useEffect(() => {
        // Set initial theme based on time
        setCurrentTheme(getCurrentTimeTheme());

        // Update theme every hour
        const themeInterval = setInterval(() => {
            setCurrentTheme(getCurrentTimeTheme());
        }, 60 * 60 * 1000);

        // Retrieve user role and data from localStorage
        const storedRole = localStorage.getItem("userRole");
        const storedUser = localStorage.getItem("user");

        if (storedRole) {
            setUserRole(storedRole.toLowerCase());
        }
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUsername(parsedUser.username);
            } catch (error) {
                console.error("Failed to parse user data:", error);
            }
        }
        // If no token is found, redirect to login
        if (!localStorage.getItem("token")) {
            navigate("/login");
        }

        return () => clearInterval(themeInterval);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("userRole");
        navigate("/login");
    };

    // Get initials for the Avatar
    const getInitials = () => {
        if (!username) return "U";
        return username
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <Layout style={{ height: "100vh" }}>
            <Sider
                collapsed={collapsed}
                width={250}
                style={{
                    position: "relative",
                    height: "100vh",
                    overflow: "auto",
                    background: currentTheme.siderBg,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    transition: "background 0.3s ease"
                }}
                trigger={null} // Remove the default collapse trigger
                collapsible
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px 0",
                        borderBottom: `1px solid ${currentTheme.borderColor}`,
                    }}
                >
                    {!collapsed && <FaCloudSun size={32} color={currentTheme.iconColor} style={{ marginRight: "10px" }} />}
                    {!collapsed ? (
                        <Text strong style={{ fontSize: "20px", color: currentTheme.primaryText }}>
                            AQI Meter
                        </Text>
                    ) : (
                        <FaCloudSun size={24} color={currentTheme.iconColor} />
                    )}
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "16px 0",
                        borderBottom: `1px solid ${currentTheme.borderColor}`,
                    }}
                >
                    <Avatar
                        size={collapsed ? 40 : 50}
                        style={{
                            backgroundColor: currentTheme.iconColor,
                            verticalAlign: "middle",
                            boxShadow: `0 2px 5px rgba(0, 0, 0, 0.2)`
                        }}
                    >
                        {getInitials()}
                    </Avatar>
                    {!collapsed && (
                        <div style={{ marginLeft: "12px" }}>
                            <Text strong style={{ fontSize: "15px", display: "block", color: currentTheme.primaryText }}>
                                {username || "User"}
                            </Text>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                {userRole === "admin" ? "Administrator" : "Weather Technician"}
                            </Text>
                        </div>
                    )}
                </div>

                <Menu
                    mode="inline"
                    defaultSelectedKeys={["1"]}
                    style={{
                        borderRight: "none",
                        background: "transparent",
                        padding: "12px 0"
                    }}
                >
                    <Menu.Item key="1" icon={<IoHome size={18} color={currentTheme.iconColor} />}>
                        <Link to="/dashboard" style={{ color: colors.textPrimary }}>Dashboard</Link>
                    </Menu.Item>
                    <Menu.Item key="2" icon={<FaMapMarked size={18} color={currentTheme.iconColor} />}>
                        <Link to="/dashboard/map" style={{ color: colors.textPrimary }}>AQI Map</Link>
                    </Menu.Item>
                    <Menu.Item key="3" icon={
                        <Badge count={alertCount} size="small" offset={[2, 0]}>
                            <MdOutlineCrisisAlert size={18} color={colors.danger} />
                        </Badge>
                    }>
                        <Link to="/dashboard/alerts" style={{ color: colors.textPrimary }}>Alerts</Link>
                    </Menu.Item>
                    <Menu.Item key="4" icon={<MdHistory size={18} color={currentTheme.iconColor} />}>
                        <Link to="/dashboard/history" style={{ color: colors.textPrimary }}>AQI History</Link>
                    </Menu.Item>
                    {userRole === "admin" && (
                        <Menu.Item key="5" icon={<IoSettingsSharp size={18} color={currentTheme.iconColor} />}>
                            <Link to="/dashboard/settings" style={{ color: colors.textPrimary }}>Sensor Settings</Link>
                        </Menu.Item>
                    )}
                </Menu>
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        width: "100%",
                        padding: "16px",
                        textAlign: "center",
                        borderTop: `1px solid ${currentTheme.borderColor}`,
                        background: currentTheme.siderBg,
                    }}
                >
                    <Tooltip title="Logout">
                        <Button
                            icon={<LogoutOutlined style={{ color: currentTheme.iconColor }} />}
                            onClick={handleLogout}
                            block
                            style={{
                                borderRadius: "6px",
                                height: "40px",
                                color: currentTheme.primaryText,
                                borderColor: currentTheme.borderColor,
                                background: "transparent"
                            }}
                        >
                            {!collapsed && "Logout"}
                        </Button>
                    </Tooltip>
                </div>
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: "0 24px",
                        background: currentTheme.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: "64px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transition: "background 0.3s ease"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: "16px",
                                width: 48,
                                height: 48,
                                color: "#ffffff"
                            }}
                        />
                        <div style={{ marginLeft: "16px", color: "#ffffff" }}>
                            <Text strong style={{ color: "#ffffff", fontSize: "18px" }}>
                                Air Quality Index Monitoring System
                            </Text>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <Text style={{ color: "#ffffff", fontWeight: 500 }}>
                            <CloudOutlined style={{ marginRight: "8px" }} />
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </Text>
                        <Tooltip title="Logout">
                            <Button
                                type="text"
                                icon={<LogoutOutlined />}
                                onClick={handleLogout}
                                style={{ color: "#ffffff" }}
                            />
                        </Tooltip>
                        <Avatar style={{
                            backgroundColor: "#ffffff",
                            color: currentTheme.iconColor,
                            verticalAlign: "middle"
                        }}>
                            {getInitials()}
                        </Avatar>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: "16px",
                        padding: 0,
                        background: colors.background,
                        borderRadius: "12px",
                        height: "calc(100vh - 96px)",
                        overflowY: "auto",
                    }}
                >
                    <div style={{ padding: "20px" }}>
                        <Routes>
                            <Route path="/" element={<DashboardHome />} />
                            <Route path="/map" element={<MapView />} />
                            <Route path="/alerts" element={<AlertsPage />} />
                            <Route path="/history" element={<HistoricalData />} />
                            {(userRole === "admin" || userRole == "data analyst") && <Route path="/settings" element={<SensorManagement />} />}
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Dashboard;