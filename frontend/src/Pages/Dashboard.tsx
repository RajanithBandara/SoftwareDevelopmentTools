import React, { useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from "@ant-design/icons";
import { FaMapMarked } from "react-icons/fa";
import { MdOutlineCrisisAlert, MdHistory } from "react-icons/md";
import { IoHome, IoSettingsSharp } from "react-icons/io5";
import { Button, Layout, Menu, theme, Avatar, Tooltip } from "antd";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import DashboardHome from "./DashComponents/Home";
import MapView from "./DashComponents/MapView";
import HistoricalData from "./DashComponents/HistoricData";
import AlertsPage from "./DashComponents/Alerts.tsx";

const { Header, Sider, Content } = Layout;

const Dashboard: React.FC = () => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear stored authentication tokens
        localStorage.removeItem("token");
        sessionStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <Layout style={{ height: "100vh" }}>
            <Sider
                theme="light"
                collapsible
                collapsed={collapsed}
                width={250}
                style={{ height: "100vh", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "auto" }}
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
                    <Menu.Item key="5" icon={<IoSettingsSharp />}>
                        <Link to="/dashboard/settings">Settings</Link>
                    </Menu.Item>
                </Menu>
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        width: "100%",
                        padding: "10px",
                        textAlign: "center",
                        borderTop: "1px solid #f0f0f0",
                    }}
                >
                    <Tooltip title="Logout">
                        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} block>
                            {!collapsed && "Logout"}
                        </Button>
                    </Tooltip>
                </div>
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
                    <div>
                        <Tooltip title="Notifications">
                            <Button type="text" icon={<MdOutlineCrisisAlert />} style={{ marginRight: "10px" }} />
                        </Tooltip>
                        <Avatar style={{ backgroundColor: "#1890ff", verticalAlign: "middle" }}>U</Avatar>
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
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Dashboard;
