import React, { useState, useEffect } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from "@ant-design/icons";
import { FaMapMarked } from "react-icons/fa";
import { MdOutlineCrisisAlert, MdHistory } from "react-icons/md";
import { IoHome, IoSettingsSharp } from "react-icons/io5";
import { Button, Layout, Menu, theme, Avatar, Tooltip, Typography } from "antd";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import DashboardHome from "./DashComponents/Home";
import MapView from "./DashComponents/MapView";
import HistoricalData from "./DashComponents/HistoricData";
import AlertsPage from "./DashComponents/Alerts";
import axios from "axios";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const Dashboard: React.FC = () => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [username, setUsername] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user role from sessionStorage/localStorage
        const role = sessionStorage.getItem("userRole") || localStorage.getItem("userRole");
        setUserRole(role);

        // Fetch user data from backend
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            // Get token from storage
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            // Make API call to fetch user data
            const response = await axios.get("/api/user/profile", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data && response.data.username) {
                setUsername(response.data.username);
                // Optionally update user role if it comes from the API
                if (response.data.role) {
                    setUserRole(response.data.role);
                    sessionStorage.setItem("userRole", response.data.role);
                }
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            // Handle error - maybe redirect to login if unauthorized
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("userRole");
        navigate("/login");
    };

    // Get initials for avatar
    const getInitials = () => {
        if (!username) return "U";
        return username
            .split(" ")
            .map(name => name[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <Layout style={{ height: "100vh" }}>
            <Sider
                theme="light"
                collapsible
                collapsed={collapsed}
                width={250}
                style={{
                    height: "100vh",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    overflow: "auto",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px 0",
                        borderBottom: "1px solid #f0f0f0",
                    }}
                >
                    <Avatar size={collapsed ? 40 : 64} style={{ backgroundColor: "#1890ff", verticalAlign: "middle" }}>
                        AQ
                    </Avatar>
                    {!collapsed && (
                        <span style={{ marginLeft: "10px", fontSize: "18px", fontWeight: 600 }}>Air Quality</span>
                    )}
                </div>
                <Menu theme="light" mode="inline" defaultSelectedKeys={["1"]} style={{ borderRight: "none" }}>
                    <Menu.Item key="1" icon={<IoHome />}>
                        <Link to="/dashboard">Home</Link>
                    </Menu.Item>
                    <Menu.Item key="2" icon={<FaMapMarked />}>
                        <Link to="/dashboard/map">Map View</Link>
                    </Menu.Item>
                    <Menu.Item key="3" icon={<MdOutlineCrisisAlert />}>
                        <Link to="/dashboard/alerts">Alerts</Link>
                    </Menu.Item>
                    <Menu.Item key="4" icon={<MdHistory />}>
                        <Link to="/dashboard/history">History</Link>
                    </Menu.Item>
                    {userRole === "admin" && (
                        <Menu.Item key="5" icon={<IoSettingsSharp />}>
                            <Link to="/dashboard/settings">Settings</Link>
                        </Menu.Item>
                    )}
                </Menu>
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: "0 24px",
                        background: colorBgContainer,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: "16px", width: 64, height: 64 }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        {!loading && username && (
                            <Text style={{ fontSize: "14px" }}>
                                Welcome, <strong>{username}</strong>
                            </Text>
                        )}
                        <Tooltip title="Logout">
                            <Button
                                type="text"
                                icon={<LogoutOutlined />}
                                onClick={handleLogout}
                                style={{ fontSize: "16px" }}
                            />
                        </Tooltip>
                        <Tooltip title={username || "User"}>
                            <Avatar style={{ backgroundColor: "#1890ff", verticalAlign: "middle" }}>
                                {getInitials()}
                            </Avatar>
                        </Tooltip>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: "16px",
                        padding: 24,
                        minHeight: 280,
                        background: "#f0f2f5",
                        borderRadius: borderRadiusLG,
                        height: "calc(100vh - 96px)",
                        overflowY: "auto",
                    }}
                >
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/map" element={<MapView />} />
                        <Route path="/alerts" element={<AlertsPage />} />
                        <Route path="/history" element={<HistoricalData />} />
                        {userRole === "admin" && <Route path="/settings" element={<div>Settings Page</div>} />}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Dashboard;