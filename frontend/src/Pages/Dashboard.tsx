import React, { useState } from "react";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from "@ant-design/icons";
import { FaMapMarked } from "react-icons/fa";
import { MdOutlineCrisisAlert, MdHistory } from "react-icons/md";
import { IoHome } from "react-icons/io5";
import { Button, Layout, Menu, theme } from "antd";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import DashboardHome from "./DashComponents/Home";
import MapView from "./DashComponents/MapView";
import AlertView from "./DashComponents/Alerts";
import HistoricalData from "./DashComponents/HistoricData";

const { Header, Sider, Content } = Layout;

const Dashboard: React.FC = () => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Router>
            <Layout style={{ height: "100vh" }}>
                <Sider
                    theme="light"
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    style={{ height: "100vh" }}
                >
                    <div className="demo-logo-vertical" />
                    <Menu
                        theme="light"
                        mode="inline"
                        defaultSelectedKeys={["1"]}
                        items={[
                            {
                                key: "1",
                                icon: <IoHome />,
                                label: <Link to="/">Home</Link>, // Link to Home page
                            },
                            {
                                key: "2",
                                icon: <FaMapMarked />,
                                label: <Link to="/MapView">MapView</Link>, // Link to MapView
                            },
                            {
                                key: "3",
                                icon: <MdOutlineCrisisAlert />,
                                label: <Link to="/AlertView">Alerts</Link>, // Link to Alerts
                            },
                            {
                                key: "4",
                                icon: <MdHistory />,
                                label: <Link to="/History">History</Link>, // Link to History
                            },
                        ]}
                    />
                </Sider>
                <Layout>
                    <Header
                        style={{
                            padding: 0,
                            background: colorBgContainer,
                        }}
                    >
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: "16px",
                                width: 64,
                                height: 64,
                            }}
                        />
                    </Header>
                    <Content
                        style={{
                            margin: "24px 16px",
                            padding: 24,
                            minHeight: 280,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                            height: "calc(100vh - 64px)",
                        }}
                    >
                        {/* Define the routes */}
                        <Routes>
                            <Route path="/" element={<DashboardHome />} />
                            <Route path="/MapView" element={<MapView />} />
                            <Route path="/AlertView" element={<AlertView aqiAlerts={[]} />} />
                            <Route path="/History" element={<HistoricalData />} />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </Router>
    );
};

export default Dashboard;
