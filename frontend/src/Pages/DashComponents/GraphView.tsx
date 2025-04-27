import React, { useEffect, useState } from "react";
import {Card, Typography, message, Spin, Select, Button} from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";

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
            const defaultSensor = uniqueSensors.includes("1") ? "1" : uniqueSensors[0];
            setSensorFilter(defaultSensor);

            // Filter data for this sensor and the selected time period
            filterData(formattedData, timeFilter, defaultSensor);
        } catch (error) {
            message.error("Error fetching historical AQI data.");
            console.error("Fetch error:", error);
        }
        setLoading(false);
    };

    const extractSensors = (rawData: any[]): string[] => {
        const uniqueSensors = Array.from(new Set(rawData.map(item => item.sensorId)));
        const sortedSensors = uniqueSensors.sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return a.localeCompare(b);
        });
        setSensors(sortedSensors);
        return sortedSensors;
    };

    // New filterData: returns raw individual data points without averaging/grouping.
    const filterData = (rawData: any[], filter: string, selectedSensor: string | null) => {
        let filtered = rawData;
        const now = dayjs();

        // Filter by sensor first
        if (selectedSensor) {
            filtered = filtered.filter(item => item.sensorId === selectedSensor);
        }

        // Apply time filter to return individual data points:
        switch (filter) {
            case "hourly":
                filtered = filtered.filter(item => dayjs(item.recordedAt).isAfter(now.subtract(12, 'hour')));
                break;
            case "daily":
                filtered = filtered.filter(item => dayjs(item.recordedAt).isAfter(now.subtract(7, 'day')));
                break;
            case "monthly":
                filtered = filtered.filter(item => dayjs(item.recordedAt).isAfter(now.subtract(1, 'month')));
                break;
            default:
                break;
        }

        // Sort data from past to present
        filtered.sort((a, b) => dayjs(a.recordedAt).valueOf() - dayjs(b.recordedAt).valueOf());
        setFilteredData(filtered);
    };

    useEffect(() => {
        fetchHistoricalData();
        // Refresh every 5 minutes
        const intervalId = setInterval(() => {
            fetchHistoricalData();
        }, 5 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        filterData(data, timeFilter, sensorFilter);
    }, [timeFilter, sensorFilter, data]);

    const getChartTitle = () => {
        switch (timeFilter) {
            case "hourly": return "Raw AQI Readings (Last 12 Hours)";
            case "daily": return "Raw AQI Readings (Last 7 Days)";
            case "monthly": return "Raw AQI Readings (Last Month)";
            default: return "Air Quality Index Over Time";
        }
    };

    // Format X-axis based on time filter
    const formatXAxisTick = (value: string) => {
        switch (timeFilter) {
            case "hourly":
                return dayjs(value).format("HH:mm");
            case "daily":
                return dayjs(value).format("MMM DD");
            case "monthly":
                return dayjs(value).format("MMM YYYY");
            default:
                return value;
        }
    };

    // Format tooltip label
    const formatTooltipLabel = (value: string) => {
        switch (timeFilter) {
            case "hourly":
                return dayjs(value).format("MMM DD, YYYY HH:mm");
            case "daily":
                return dayjs(value).format("MMM DD, YYYY");
            case "monthly":
                return dayjs(value).format("MMMM YYYY");
            default:
                return value;
        }
    };

    const navigate = useNavigate();

    const navigateAllhistory = () => {
        navigate('/fullhistory');
    };

    // Determine line color based on raw data (displaying each point without averaging)
    const getLineColor = () => {
        if (filteredData.length === 0) return "#82ca9d";
        // Use a simple threshold based on the most recent reading
        const lastValue = filteredData[filteredData.length - 1].aqiValue;
        if (lastValue > 300) return "#7e0023";
        if (lastValue > 200 && lastValue <= 300) return "#8F3F97";
        if (lastValue > 150 && lastValue <= 200) return "#FF0000";
        if (lastValue > 100 && lastValue <= 150) return "#FF7E00";
        if (lastValue > 50 && lastValue <= 100) return "#99da17";
        return "#00E400";
    };

    return (
        <Card
            title="AQI Historical Graph"
            className="bg-white rounded-lg shadow-lg"
            bordered={false}
        >
            <Title level={4}>{getChartTitle()}</Title>

            <div className="flex flex-wrap items-center gap-4 mb-6">
                <Select
                    value={timeFilter}
                    style={{ width: 150 }}
                    onChange={value => setTimeFilter(value)}
                >
                    <Option value="hourly">Last 12 Hours</Option>
                    <Option value="daily">Last 7 Days</Option>
                    <Option value="monthly">Last Month</Option>
                </Select>

                <Select
                    value={sensorFilter}
                    style={{ width: 200 }}
                    onChange={value => setSensorFilter(value)}
                >
                    {sensors.map(sensor => (
                        <Option key={sensor} value={sensor}>Sensor {sensor}</Option>
                    ))}
                </Select>

                <button
                    onClick={fetchHistoricalData}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                >
                    Refresh Data
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : filteredData.length === 0 ? (
                <div className="flex justify-center items-center h-64 text-gray-500">
                    No data available for the selected filter
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={filteredData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="recordedAt"
                            tick={{ fontSize: 12 }}
                            angle={-30}
                            textAnchor="end"
                            tickFormatter={formatXAxisTick}
                            height={60}
                        />
                        <YAxis
                            label={{ value: 'AQI Value', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                        />
                        <Tooltip
                            labelFormatter={formatTooltipLabel}
                            formatter={(value) => [`${value} AQI`, 'Air Quality']}
                        />
                        <Line
                            type="monotone"
                            dataKey="aqiValue"
                            stroke={getLineColor()}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Air Quality"
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}

            <div className="text-xs text-gray-500 mt-4">

                Full Simulation History :
                    <Button variant={"text"} color={"volcano"} className={"text-xs p-0.5"} onClick={navigateAllhistory}>More Data</Button>
            </div>
        </Card>
    );
};

export default GraphView;