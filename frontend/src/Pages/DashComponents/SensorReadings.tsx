import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, RefreshCw, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Air quality assessment helper
const getAqiCategory = (value) => {
    if (value <= 50) return { category: 'Good', color: 'bg-green-500', textColor: 'text-green-700' };
    if (value <= 100) return { category: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (value <= 150) return { category: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500', textColor: 'text-orange-700' };
    if (value <= 200) return { category: 'Unhealthy', color: 'bg-red-500', textColor: 'text-red-700' };
    if (value <= 300) return { category: 'Very Unhealthy', color: 'bg-purple-500', textColor: 'text-purple-700' };
    return { category: 'Hazardous', color: 'bg-red-900', textColor: 'text-red-900' };
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Individual Sensor Card Component
const SensorCard = ({ sensor, expanded, onToggleExpand }) => {
    const { category, color, textColor } = getAqiCategory(sensor.readings[0]?.aqiValue || 0);

    // Format the chart data
    const chartData = sensor.readings
        .slice()
        .reverse()
        .map(reading => ({
            time: formatDate(reading.recordedAt),
            aqi: reading.aqiValue
        }));

    return (
        <div className={`rounded-lg shadow-md transition-all duration-500 ease-in-out overflow-hidden 
                    ${expanded ? 'col-span-2 md:col-span-2' : 'col-span-1'} 
                    transform hover:shadow-lg hover:scale-101`}>
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="p-4 flex justify-between items-center border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center">
                        <MapPin className="mr-2 text-gray-600" size={18} />
                        <h3 className="font-medium text-lg text-gray-800">{sensor.location}</h3>
                    </div>
                    <div className="flex items-center">
                        {sensor.status ? (
                            <span className="flex items-center text-green-600">
                <Activity className="mr-1" size={16} /> Active
              </span>
                        ) : (
                            <span className="flex items-center text-red-600">
                <AlertTriangle className="mr-1" size={16} /> Inactive
              </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Latest Reading */}
                    {sensor.readings.length > 0 && (
                        <div className="mb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-sm text-gray-500">Air Quality Index</span>
                                    <div className="flex items-baseline">
                    <span className="text-3xl font-bold mr-2">
                      {sensor.readings[0].aqiValue}
                    </span>
                                        <span className={`text-sm font-medium ${textColor}`}>
                      {category}
                    </span>
                                    </div>
                                </div>
                                <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center transition-all animate-pulse`}>
                  <span className="text-white font-bold text-xl">
                    {sensor.readings[0].aqiValue}
                  </span>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Last updated: {formatDate(sensor.readings[0].recordedAt)}
                            </div>
                        </div>
                    )}

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
                        <div
                            className={`${color} h-2.5 rounded-full transition-all duration-700 ease-in-out`}
                            style={{ width: `${Math.min(100, (sensor.readings[0]?.aqiValue / 3))}%` }}
                        ></div>
                    </div>

                    {/* Chart - only show when expanded */}
                    {expanded && (
                        <div className="mt-4 h-64 transition-all duration-500 ease-in-out">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Historical Readings</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip contentStyle={{ fontSize: 12 }} />
                                    <Line
                                        type="monotone"
                                        dataKey="aqi"
                                        stroke="#4f46e5"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6, strokeWidth: 2 }}
                                        animationDuration={1000}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Expand button */}
                    <button
                        onClick={() => onToggleExpand(sensor.sensorId)}
                        className="mt-4 w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium
                      flex items-center justify-center transition-colors"
                    >
                        {expanded ? "Show Less" : "Show History"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SensorReadings = () => {
    const [sensorData, setSensorData] = useState([]);
    const [expandedCard, setExpandedCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshAnimation, setRefreshAnimation] = useState(false);
    const [error, setError] = useState(null);

    const fetchSensorReadings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/sensors/latest-readings');

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setSensorData(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching sensor readings:', error);
            setError('Failed to fetch sensor data. Please check your connection and try again.');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSensorReadings();

        // Optional: Set up polling to refresh data every X seconds
        const intervalId = setInterval(() => {
            fetchSensorReadings();
        }, 60000); // Refresh every minute

        return () => clearInterval(intervalId); // Clean up on unmount
    }, []);

    const handleRefresh = () => {
        setRefreshAnimation(true);
        fetchSensorReadings().then(() => {
            setTimeout(() => {
                setRefreshAnimation(false);
            }, 1000);
        });
    };

    const toggleExpand = (sensorId) => {
        if (expandedCard === sensorId) {
            setExpandedCard(null);
        } else {
            setExpandedCard(sensorId);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
                {/* Header with animation */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                        Air Quality Monitoring Dashboard
                    </h1>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center justify-center bg-white p-2 rounded-full shadow-md
                      hover:bg-gray-50 transition-colors"
                        disabled={isLoading}
                    >
                        <RefreshCw
                            size={20}
                            className={`text-indigo-600 ${refreshAnimation || isLoading ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                        <p className="flex items-center">
                            <AlertTriangle className="mr-2" size={18} />
                            {error}
                        </p>
                    </div>
                )}

                {/* Status overview */}
                {!isLoading && !error && sensorData.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                <p className="text-sm text-gray-500">Active Sensors</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {sensorData.filter(s => s.status).length}
                                </p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                <p className="text-sm text-gray-500">Inactive Sensors</p>
                                <p className="text-2xl font-bold text-red-700">
                                    {sensorData.filter(s => !s.status).length}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-sm text-gray-500">Average AQI</p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {sensorData.length > 0
                                        ? Math.round(
                                            sensorData.reduce((sum, sensor) =>
                                                sum + (sensor.readings[0]?.aqiValue || 0), 0) / sensorData.length
                                        )
                                        : 0
                                    }
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                <p className="text-sm text-gray-500">Total Latest Readings</p>
                                <p className="text-2xl font-bold text-purple-700">
                                    {sensorData.reduce((sum, sensor) => sum + sensor.readings.length, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-gray-600">Loading sensor data...</p>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-64">
                        <button
                            onClick={handleRefresh}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : sensorData.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-sm p-6">
                        <AlertTriangle size={36} className="text-yellow-500 mb-4" />
                        <p className="text-gray-700 mb-4">No sensor data available</p>
                        <button
                            onClick={handleRefresh}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {sensorData.map((sensor) => (
                            <SensorCard
                                key={sensor.sensorId}
                                sensor={sensor}
                                expanded={expandedCard === sensor.sensorId}
                                onToggleExpand={toggleExpand}
                            />
                        ))}
                    </div>
                )}

                {/* Last updated timestamp */}
                {!isLoading && !error && sensorData.length > 0 && (
                    <div className="text-center text-gray-500 text-sm mt-8">
                        Last updated: {new Date().toLocaleString()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SensorReadings;