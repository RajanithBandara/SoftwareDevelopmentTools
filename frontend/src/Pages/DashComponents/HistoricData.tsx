import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, Table, Typography, message } from "antd";
import axios from "axios";

const { Title } = Typography;

const pageVariants = {
    initial: { opacity: 0, x: 50, scale: 0.95 },
    in: { opacity: 1, x: 0, scale: 1, transition: { delay: 0.1, duration: 0.5, ease: "easeOut" } },
    out: { opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } }
};

const HistoricalData: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistoricalData = async () => {
        setLoading(true);
        try {
            // Adjust the endpoint URL if needed.
            const response = await axios.get("http://localhost:5000/api/airquality/history");
            setData(response.data);
        } catch (error) {
            message.error("Error fetching historical data.");
            console.error("Fetch error:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHistoricalData();
    }, []);

    const columns = [
        {
            title: "Reading ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Sensor ID",
            dataIndex: "sensorId",
            key: "sensorId",
        },
        {
            title: "AQI Value",
            dataIndex: "aqiValue",
            key: "aqiValue",
        },
        {
            title: "Recorded At",
            dataIndex: "recordedAt",
            key: "recordedAt",
            render: (value: string) => new Date(value).toLocaleString(),
        },
    ];

    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
        >
            <Card
                title="Historical Data"
                className="bg-white rounded-lg shadow-lg"
                bordered={false}
            >
                <Title level={4}>Air Quality Readings History</Title>
                <Table
                    dataSource={data}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </motion.div>
    );
};

export default HistoricalData;