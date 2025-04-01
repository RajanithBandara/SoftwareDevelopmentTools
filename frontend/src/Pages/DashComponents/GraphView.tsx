import React, { useEffect, useState } from "react";
import { Card, Typography, message, Spin, Select } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

const GraphView: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [timeFilter, setTimeFilter] = useState("hourly");
    const [sensorFilter, setSensorFilter] = useState<string>("1"); // Default to sensor "1"
    const [sensors, setSensors] = useState<string[]>([]);

    const fetchHistoricalData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/api/airquality/history");
            const formattedData = response.data.map((item: any) => ({
                recordedAt: item.recordedAt,
                aqiValue: item.aqiValue,
                sensorId: item.sensorId
            }));
            setData(formattedData);

            // Extract and sort sensors, then set default
            const uniqueSensors = extractSensors(formattedData);

            // Set default sensor if sensor "1" exists, otherwise use first sensor
            const defaultSensor = uniqueSensors.includes("1") ? "1" : uniqueSensors[0];
            setSensorFilter(defaultSensor);

            // Filter data with the default sensor
            filterData(formattedData, "hourly", defaultSensor);
        } catch (error) {
            message.error("Error fetching historical AQI data.");
            console.error("Fetch error:", error);
        }
        setLoading(false);
    };

    const extractSensors = (rawData: any[]): string[] => {
        // Extract unique sensors
        const uniqueSensors = Array.from(new Set(rawData.map(item => item.sensorId)));
        // Sort sensors in ascending order (numerically if possible)
        const sortedSensors = uniqueSensors.sort((a, b) => {
            // Try numeric sorting first
            const numA = parseInt(a);
            const numB = parseInt(b);

            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            // Fall back to string comparison if not numbers
            return a.localeCompare(b);
        });

        setSensors(sortedSensors);
        return sortedSensors;
    };

    const filterData = (rawData: any[], filter: string, selectedSensor: string | null) => {
        let groupedData: any[] = [];
        const now = dayjs();
        let filtered = rawData.filter(item => dayjs(item.recordedAt).isAfter(now.subtract(12, 'hour')));

        if (selectedSensor) {
            filtered = filtered.filter(item => item.sensorId === selectedSensor);
        }

        if (filter === "hourly") {
            groupedData = filtered.map(item => ({
                recordedAt: dayjs(item.recordedAt).format("YYYY-MM-DD HH:00"),
                aqiValue: item.aqiValue
            }));
        } else if (filter === "monthly") {
            const monthlyData: { [key: string]: number[] } = {};
            rawData.forEach(item => {
                const month = dayjs(item.recordedAt).format("YYYY-MM");
                if (!monthlyData[month]) monthlyData[month] = [];
                monthlyData[month].push(item.aqiValue);
            });
            groupedData = Object.keys(monthlyData).map(month => ({
                recordedAt: month,
                aqiValue: Math.round(monthlyData[month].reduce((a, b) => a + b, 0) / monthlyData[month].length)
            }));
        }
        setFilteredData(groupedData);
    };

    useEffect(() => {
        fetchHistoricalData();
    }, []);

    useEffect(() => {
        filterData(data, timeFilter, sensorFilter);
    }, [timeFilter, sensorFilter, data]);

    return (
        <Card title="AQI Historical Graph" className="bg-white rounded-lg shadow-lg" bordered={false}>
            <Title level={4}>Air Quality Index Over Time</Title>
            <Select
                defaultValue="hourly"
                style={{ width: 150, marginBottom: 20, marginRight: 10 }}
                onChange={value => setTimeFilter(value)}
            >
                <Option value="hourly">Hourly</Option>
                <Option value="monthly">Monthly</Option>
            </Select>
            <Select
                value={sensorFilter}
                style={{ width: 200, marginBottom: 20 }}
                onChange={value => setSensorFilter(value)}
            >
                {sensors.map(sensor => (
                    <Option key={sensor} value={sensor}>Sensor {sensor}</Option>
                ))}
            </Select>
            {loading ? (
                <Spin size="large" />
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="recordedAt" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="aqiValue" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
};

export default GraphView;