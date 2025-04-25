import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Define a type for sensor details
interface Sensor {
    id: number;
    location: string;
    latitude: number;
    longitude: number;
    aqiValue: number;
    lastUpdated?: string;
}

// AQI categories and colors
const getAQICategory = (aqi: number): { label: string, color: string, textColor: string } => {
    if (aqi <= 50) return { label: "Good", color: "#00e400", textColor: "#000000" };
    if (aqi <= 100) return { label: "Moderate", color: "#ffff00", textColor: "#000000" };
    if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "#ff7e00", textColor: "#000000" };
    if (aqi <= 200) return { label: "Unhealthy", color: "#ff0000", textColor: "#ffffff" };
    if (aqi <= 300) return { label: "Very Unhealthy", color: "#8f3f97", textColor: "#ffffff" };
    return { label: "Hazardous", color: "#7e0023", textColor: "#ffffff" };
};

// Create a custom icon factory function
const createAQIIcon = (aqi: number) => {
    const { color, textColor } = getAQICategory(aqi);

    return L.divIcon({
        className: "custom-aqi-icon",
        html: `
            <div style="
                background-color: ${color};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 2px solid #ffffff;
                box-shadow: 0 0 5px rgba(0,0,0,0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${textColor};
                font-size: 12px;
                font-weight: bold;
                transform: translate(-50%, -50%);
            ">
                ${aqi}
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
};

// Custom Legend component as a controlled component inside the map
const Legend = () => {
    const [expanded, setExpanded] = useState(true);

    const legendItems = [
        { range: "0-50", label: "Good", color: "#00e400" },
        { range: "51-100", label: "Moderate", color: "#ffff00" },
        { range: "101-150", label: "Unhealthy for Sensitive Groups", color: "#ff7e00" },
        { range: "151-200", label: "Unhealthy", color: "#ff0000" },
        { range: "201-300", label: "Very Unhealthy", color: "#8f3f97" },
        { range: "301+", label: "Hazardous", color: "#7e0023" }
    ];

    return (
        <div className="leaflet-bottom leaflet-right">
            <div className="leaflet-control leaflet-bar" style={{
                backgroundColor: "white",
                padding: expanded ? "12px" : "8px",
                margin: "10px",
                borderRadius: "6px",
                boxShadow: "0 1px 5px rgba(0,0,0,0.4)",
                maxWidth: "250px",
                fontSize: "12px",
                position: "relative",
                zIndex: 1000,
                opacity: 0.9
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    paddingBottom: expanded ? "8px" : "0",
                    borderBottom: expanded ? "1px solid #e0e0e0" : "none",
                    fontWeight: "bold"
                }} onClick={() => setExpanded(!expanded)}>
                    Air Quality Index
                    <span style={{ marginLeft: "10px" }}>
                        {expanded ? "▼" : "▶"}
                    </span>
                </div>

                {expanded && (
                    <div style={{ marginTop: "8px" }}>
                        {legendItems.map((item, index) => (
                            <div key={index} style={{
                                display: "flex",
                                alignItems: "center",
                                margin: "6px 0",
                                fontSize: "11px"
                            }}>
                                <div style={{
                                    width: "16px",
                                    height: "16px",
                                    backgroundColor: item.color,
                                    marginRight: "8px",
                                    borderRadius: "50%",
                                    border: "1px solid rgba(0,0,0,0.2)",
                                    flexShrink: 0
                                }}></div>
                                <div>
                                    <span style={{ fontWeight: "bold" }}>{item.range}</span>: {item.label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const DesktopMapView: React.FC = () => {
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const defaultCenter: [number, number] = [6.9271, 79.8612]; // Colombo, Sri Lanka
    const zoomLevel = 13;

    useEffect(() => {
        const fetchSensors = async () => {
            try {
                setLoading(true);
                // Adjust the URL if necessary
                const response = await axios.get("http://localhost:5000/api/sensors");

                // Add formatted timestamp to each sensor
                const sensorsWithTimestamp = response.data.map((sensor: Sensor) => ({
                    ...sensor,
                    lastUpdated: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })
                }));

                setSensors(sensorsWithTimestamp);
                setError(null);
            } catch (error) {
                console.error("Error fetching sensor data:", error);
                setError("Failed to load sensor data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSensors();

        // Set up interval for regular updates
        const interval = setInterval(fetchSensors, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    if (error) {
        return (
            <div style={{
                height: "82vh",
                width: "100%",
                borderRadius: "20px",
                backgroundColor: "#f8f9fa",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                padding: "20px",
                textAlign: "center"
            }}>
                <div style={{ color: "#dc3545", fontWeight: "bold", marginBottom: "10px" }}>
                    Error
                </div>
                <div>{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: "15px",
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    // Map placeholder during loading
    if (loading && sensors.length === 0) {
        return (
            <div style={{
                height: "82vh",
                width: "100%",
                borderRadius: "20px",
                backgroundColor: "#f8f9fa",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ marginBottom: "10px" }}>Loading map data...</div>
                    <div style={{
                        width: "40px",
                        height: "40px",
                        border: "4px solid #f3f3f3",
                        borderTop: "4px solid #3498db",
                        borderRadius: "50%",
                        margin: "0 auto",
                        animation: "spin 1s linear infinite"
                    }}></div>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: "relative", height: "70vh", width: "100%" }}>
            <MapContainer
                center={defaultCenter}
                zoom={zoomLevel}
                style={{
                    height: "100%",
                    width: "100%",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ZoomControl position="bottomleft" />

                {sensors.map((sensor) => {
                    const { label, color, textColor } = getAQICategory(sensor.aqiValue);

                    return (
                        <Marker
                            key={sensor.id}
                            position={[sensor.latitude, sensor.longitude]}
                            icon={createAQIIcon(sensor.aqiValue)}
                        >
                            <Popup className="custom-popup">
                                <div style={{
                                    textAlign: "center",
                                    padding: "5px",
                                    minWidth: "180px"
                                }}>
                                    <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>
                                        {sensor.location}
                                    </div>
                                    <div
                                        style={{
                                            backgroundColor: color,
                                            color: textColor,
                                            padding: "5px 10px",
                                            borderRadius: "20px",
                                            margin: "8px 0",
                                            fontWeight: "bold",
                                            display: "inline-block",
                                            minWidth: "120px"
                                        }}
                                    >
                                        AQI: {sensor.aqiValue} - {label}
                                    </div>
                                    <div style={{
                                        fontSize: "11px",
                                        color: "#666",
                                        marginTop: "8px"
                                    }}>
                                        Last updated: {sensor.lastUpdated || new Date().toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Properly rendered legend as a Leaflet control */}
                <Legend />
            </MapContainer>

            {/* Add some global styles for leaflet customization */}
            <style jsx global>{`
                .leaflet-popup-content-wrapper {
                    border-radius: 8px;
                    box-shadow: 0 3px 14px rgba(0,0,0,0.2);
                }
                
                .leaflet-popup-content {
                    margin: 10px 12px;
                }
                
                .leaflet-popup-tip {
                    box-shadow: 0 3px 8px rgba(0,0,0,0.2);
                }
                
                .leaflet-container {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
            `}</style>
        </div>
    );
};

export default DesktopMapView;