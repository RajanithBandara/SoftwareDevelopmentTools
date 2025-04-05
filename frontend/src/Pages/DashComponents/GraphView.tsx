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
            filterData(formattedData, timeFilter, defaultSensor);
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
        let filtered = rawData;

        // First apply sensor filter
        if (selectedSensor) {
            filtered = filtered.filter(item => item.sensorId === selectedSensor);
        }

        // Then apply time filter
        switch (filter) {
            case "hourly":
                filtered = filtered.filter(item => dayjs(item.recordedAt).isAfter(now.subtract(12, 'hour')));
                groupedData = filtered.map(item => ({
                    recordedAt: dayjs(item.recordedAt).format("YYYY-MM-DD HH:00"),
                    aqiValue: item.aqiValue
                }));
                break;

            case "daily":
                filtered = filtered.filter(item => dayjs(item.recordedAt).isAfter(now.subtract(7, 'day')));
                // Group by day
                const dailyData: { [key: string]: number[] } = {};
                filtered.forEach(item => {
                    const day = dayjs(item.recordedAt).format("YYYY-MM-DD");
                    if (!dailyData[day]) dailyData[day] = [];
                    dailyData[day].push(item.aqiValue);
                });
                groupedData = Object.keys(dailyData).map(day => ({
                    recordedAt: day,
                    aqiValue: Math.round(dailyData[day].reduce((a, b) => a + b, 0) / dailyData[day].length)
                })).sort((a, b) => dayjs(a.recordedAt).diff(dayjs(b.recordedAt)));
                break;

            case "monthly":
                // No specific time filter for monthly view - use all data
                const monthlyData: { [key: string]: number[] } = {};
                filtered.forEach(item => {
                    const month = dayjs(item.recordedAt).format("YYYY-MM");
                    if (!monthlyData[month]) monthlyData[month] = [];
                    monthlyData[month].push(item.aqiValue);
                });
                groupedData = Object.keys(monthlyData).map(month => ({
                    recordedAt: month,
                    aqiValue: Math.round(monthlyData[month].reduce((a, b) => a + b, 0) / monthlyData[month].length)
                })).sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
                break;
        }

        setFilteredData(groupedData);
    };

    useEffect(() => {
        fetchHistoricalData();
    }, []);

    useEffect(() => {
        filterData(data, timeFilter, sensorFilter);
    }, [timeFilter, sensorFilter, data]);

    const getChartTitle = () => {
        switch (timeFilter) {
            case "hourly": return "Air Quality Index (Last 12 Hours)";
            case "daily": return "Air Quality Index (Last 7 Days)";
            case "monthly": return "Air Quality Index (Monthly Average)";
            default: return "Air Quality Index Over Time";
        }
    };

    return (
        <Card title="AQI Historical Graph" className="bg-white rounded-lg shadow-lg" bordered={false}>
            <Title level={4}>{getChartTitle()}</Title>
            <Select
                value={timeFilter}
                style={{ width: 150, marginBottom: 20, marginRight: 10 }}
                onChange={value => setTimeFilter(value)}
            >
                <Option value="hourly">Last 12 Hours</Option>
                <Option value="daily">Last 7 Days</Option>
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
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="recordedAt"
                            tick={{ fontSize: 12 }}
                            angle={-30}
                            textAnchor="end"
                            tickFormatter={(value) => {
                                if (timeFilter === "hourly") {
                                    return dayjs(value).format("HH:00");
                                }
                                return value;
                            }}
                        />
                        <YAxis
                            label={{ value: 'AQI Value', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            labelFormatter={(value) => {
                                if (timeFilter === "hourly") {
                                    return dayjs(value).format("YYYY-MM-DD HH:00");
                                }
                                return value;
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="aqiValue"
                            stroke="#82ca9d"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
};

export default GraphView;