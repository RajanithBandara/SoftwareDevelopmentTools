import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, Statistic, Spin, message } from "antd";
import { EnvironmentOutlined, AlertOutlined } from "@ant-design/icons";
import { MdOutlineSensors } from "react-icons/md";
import axios from "axios";

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

const DashboardHome: React.FC = () => {
    const [sensorCount, setSensorCount] = useState<number | null>(null);
    const [alertCount, setAlertCount] = useState<number | null>(null);
    const [readingCount, setReadingCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const sensorRes = await axios.get("http://localhost:5000/api/stats/sensors-count");
                const alertRes = await axios.get("http://localhost:5000/api/stats/alerts-count");
                const readingRes = await axios.get("http://localhost:5000/api/stats/reading-count");

                setSensorCount(sensorRes.data.sensorCount);
                setAlertCount(alertRes.data.alertCount);
                setReadingCount(readingRes.data.readingCount);
            } catch (error) {
                message.error("Failed to load statistics.");
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="p-6"
        >
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Sensors Card */}
                <Card
                    className="rounded-xl shadow-lg border border-gray-200 bg-white"
                    bordered={false}
                >
                    {loading ? (
                        <Spin />
                    ) : (
                        <Statistic
                            title="Total Sensors"
                            value={sensorCount ?? 0}
                            prefix={<EnvironmentOutlined style={{ color: "#1677ff", fontSize: "24px" }} />}
                            valueStyle={{ fontSize: "24px", fontWeight: "bold" }}
                        />
                    )}
                </Card>
                <br/>

                {/* Active Alerts Card */}
                <Card
                    className="rounded-xl shadow-lg border border-gray-200 bg-white"
                    bordered={false}
                >
                    {loading ? (
                        <Spin />
                    ) : (
                        <Statistic
                            title="Active Alerts"
                            value={alertCount ?? 0}
                            prefix={<AlertOutlined style={{ color: "#ff4d4f", fontSize: "24px" }} />}
                            valueStyle={{ fontSize: "24px", fontWeight: "bold" }}
                        />
                    )}
                </Card>
                <br/>
                <Card
                    className={"rounded-xl shadow-lg border border-gray-200 bg-white"}
                    bordered={false}
                    >
                    {loading ? (
                        <Spin />
                    ) : (
                        <Statistic
                            title="Readings Upto Now"
                            value={readingCount ?? 0}
                            prefix={<MdOutlineSensors style={{color: "#ff4d4f", fontSize: "24px"}} /> }
                            valueStyle={{fontSize: "27px", fontWeight: "bold"}}
                            />
                    )}
                </Card>
            </div>
        </motion.div>
    );
};

export default DashboardHome;
