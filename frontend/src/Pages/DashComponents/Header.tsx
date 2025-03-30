import React from "react";
import { Layout, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Text } = Typography;

const AppHeader: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Header
            style={{
                background: "linear-gradient(90deg, #004488, #0066aa)",
                padding: "15px 30px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                borderBottom: "3px solid #00aaff",
            }}
        >
            {/* Logo / Title */}
            <Text
                style={{
                    color: "#ffffff",
                    fontSize: "24px",
                    fontWeight: "bold",
                    letterSpacing: "1px",
                }}
            >
                🌍 AQI Monitoring
            </Text>

            {/* Navigation or Buttons */}
            <div>
                <Button
                    type="primary"
                    style={{
                        backgroundColor: "#00aaff",
                        borderColor: "#0088cc",
                        color: "#ffffff",
                        fontSize: "16px",
                        fontWeight: "bold",
                        borderRadius: "20px",
                        padding: "8px 20px",
                        transition: "0.3s",
                    }}
                    onClick={() => navigate("/login")}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#0077bb";
                        e.currentTarget.style.borderColor = "#006699";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#00aaff";
                        e.currentTarget.style.borderColor = "#0088cc";
                    }}
                >
                    Sign In
                </Button>
            </div>
        </Header>
    );
};

export default AppHeader;
