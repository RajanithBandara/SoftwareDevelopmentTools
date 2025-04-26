import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
}

// AQI categories and colors
const getAQICategory = (aqi: number): { label: string, color: string } => {
    if (aqi <= 50) return { label: "Good", color: "#00e400" };              // Green
    if (aqi <= 100) return { label: "Moderate", color: "#ffff00" };         // Yellow
    if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "#ff7e00" }; // Orange
    if (aqi <= 200) return { label: "Unhealthy", color: "#ff0000" };        // Red
    if (aqi <= 300) return { label: "Very Unhealthy", color: "#8f3f97" };   // Purple
    return { label: "Hazardous", color: "#7e0023" };                        // Maroon
};

// Create a custom icon factory function
const createAQIIcon = (aqi: number) => {
    const { color } = getAQICategory(aqi);

    return L.divIcon({
        className: "custom-aqi-icon",
        html: `
            <div style="
                background-color: ${color};
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 2px solid #ffffff;
                box-shadow: 0 0 4px rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${aqi > 150 ? '#ffffff' : '#000000'};
                font-size: 10px;
                font-weight: bold;
            ">
                ${aqi}
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
};

const MapView: React.FC = () => {
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const defaultCenter: [number, number] = [6.9271, 79.8612]; // Colombo, Sri Lanka
    const zoomLevel = 13;

    useEffect(() => {
        const fetchSensors = async () => {
            try {
                // Adjust the URL if necessary
                const response = await axios.get("http://localhost:5000/api/sensors");
                setSensors(response.data);
            } catch (error) {
                console.error("Error fetching sensor data:", error);
            }
        };

        fetchSensors();

        // Set up interval for regular updates
        const interval = setInterval(fetchSensors, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    return (
        <MapContainer
            center={defaultCenter}
            zoom={zoomLevel}
            style={{ height: "82vh", zIndex: 30, width: "100%", borderRadius: "20px" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {sensors.map((sensor) => {
                const { label, color } = getAQICategory(sensor.aqiValue);

                return (
                    <Marker
                        key={sensor.id}
                        position={[sensor.latitude, sensor.longitude]}
                        icon={createAQIIcon(sensor.aqiValue)}
                    >
                        <Popup>
                            <div style={{ textAlign: "center" }}>
                                <strong>{sensor.location}</strong>
                                <div
                                    style={{
                                        backgroundColor: color,
                                        color: sensor.aqiValue > 150 ? "#ffffff" : "#000000",
                                        padding: "3px 8px",
                                        borderRadius: "4px",
                                        margin: "5px 0",
                                        fontWeight: "bold"
                                    }}
                                >
                                    AQI: {sensor.aqiValue} - {label}
                                </div>
                                <div style={{ fontSize: "0.8rem" }}>
                                    Last updated: {new Date().toLocaleTimeString()}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Legend */}
            <div className="map-legend" style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                backgroundColor: "white",
                padding: "10px",
                borderRadius: "5px",
                boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                zIndex: 1000
            }}>
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Air Quality Index</div>
                {[
                    { range: "0-50", label: "Good", color: "#00e400" },
                    { range: "51-100", label: "Moderate", color: "#ffff00" },
                    { range: "101-150", label: "Unhealthy for Sensitive Groups", color: "#ff7e00" },
                    { range: "151-200", label: "Unhealthy", color: "#ff0000" },
                    { range: "201-300", label: "Very Unhealthy", color: "#8f3f97" },
                    { range: "301+", label: "Hazardous", color: "#7e0023" }
                ].map((item, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", margin: "2px 0" }}>
                        <div style={{
                            width: "15px",
                            height: "15px",
                            backgroundColor: item.color,
                            marginRight: "5px",
                            borderRadius: "50%",
                            border: "1px solid #ccc"
                        }}></div>
                        <div style={{ fontSize: "0.8rem" }}>{item.range}: {item.label}</div>
                    </div>
                ))}
            </div>
        </MapContainer>
    );
};

export default MapView;