import { motion } from "framer-motion";
import { Card, Statistic } from "antd";
import React from "react";

// Define props type for DashboardHome
interface DashboardHomeProps {
    sensors?: any[];    // You can replace "any" with a more specific type if available
    aqiAlerts?: any[];
}

// Page animation variants
const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
};

const pageTransition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
};

const DashboardHome: React.FC<DashboardHomeProps> = ({ sensors = [], aqiAlerts = [] }) => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white rounded-lg shadow-md" bordered={false}>
                    <Statistic
                        title="Total Sensors"
                        value={sensors.length}
                        valueStyle={{ color: "#000" }}
                    />
                </Card>
                <Card className="bg-white rounded-lg shadow-md" bordered={false}>
                    <Statistic
                        title="Active Alerts"
                        value={aqiAlerts.length}
                        valueStyle={{ color: "#000" }}
                    />
                </Card>
            </div>
        </motion.div>
    );
};

export default DashboardHome;
