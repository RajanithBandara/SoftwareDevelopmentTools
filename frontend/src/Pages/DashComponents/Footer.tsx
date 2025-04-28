import React from "react";
import { Layout, Typography } from "antd";

const { Footer } = Layout;
const { Text } = Typography;

const AppFooter: React.FC = () => {
  return (
    <Footer
      style={{
        background: "linear-gradient(90deg, #004488, #0066aa)",
        textAlign: "center",
        padding: "20px",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "bold",
        letterSpacing: "0.5px",
        borderTop: "3px solid #00aaff",
      }}
    >
      <Text>© 2025 Weather Monitoring System | Powered by Group 58</Text>
    </Footer>
  );
}

export default AppFooter;
