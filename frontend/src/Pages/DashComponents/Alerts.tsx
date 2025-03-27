import React from "react";
import { Card, Table, Tag } from "antd";
import { motion } from "framer-motion";

// Define a type for individual AQI alerts
interface AQIAlert {
    id: number | string;
    sensorId: number | string;
    AQILevel: number;
    AlertMessage: string;
}

// Define the component's props type
interface AlertViewProps {
    aqiAlerts: AQIAlert[];
}

const AlertView: React.FC<AlertViewProps> = ({ aqiAlerts }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}  // Start with 0 opacity
            animate={{ opacity: 1 }}   // Animate to full opacity
            transition={{ duration: 0.5 }} // 0.5 seconds for the fade-in effect
            className="p-4" // Padding around the card for extra spacing
        >
            <Card
                title="Alerts"
                className="bg-white rounded-lg shadow-md"
                bordered={false}
            >
                <motion.div
                    initial={{ opacity: 0 }}  // Start with 0 opacity
                    animate={{ opacity: 1 }}   // Animate to full opacity
                    transition={{ delay: 0.3, duration: 0.5 }} // Delay a bit after the card animates
                >
                    <Table
                        dataSource={aqiAlerts}
                        columns={[
                            {
                                title: "Sensor ID",
                                dataIndex: "sensorId",
                                key: "sensorId",
                                render: (text: any) => <span className="text-black">{text}</span>,
                            },
                            {
                                title: "AQI Level",
                                dataIndex: "AQILevel",
                                key: "AQILevel",
                                render: (AQILevel: number) => {
                                    let color = AQILevel < 50 ? "green" : AQILevel < 100 ? "gold" : "red";
                                    return <Tag color={color}>{AQILevel}</Tag>;
                                },
                            },
                            {
                                title: "Message",
                                dataIndex: "AlertMessage",
                                key: "AlertMessage",
                                render: (text: any) => <span className="text-black">{text}</span>,
                            },
                        ]}
                        rowKey="id"
                        pagination={false}
                        className="bg-white"
                    />
                </motion.div>
            </Card>
        </motion.div>
    );
};

export default AlertView;
