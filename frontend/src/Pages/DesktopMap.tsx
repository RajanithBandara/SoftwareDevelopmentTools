import React, { useState, useEffect } from "react";
import { Layout, Button, Typography } from "antd";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Fix default icon issue in Leaflet with React
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const { Header, Footer, Content } = Layout;
const { Text } = Typography;

const defaultIcon = new L.Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Define a type for sensor details
interface Sensor {
    id: number;
    location: string;
    latitude: number;
    longitude: number;
    aqiValue: number;
}

const DesktopMapView: React.FC = () => {
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
    }, []);

    return (
        <Layout style={{ height: "100vh", background: "linear-gradient(to bottom, #87CEEB, #ffffff)" }}>
            {/* Header Section */}
            <Header style={{ background: "#004488", padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", borderBottom: "3px solid #00aaff" }}>
                <Text style={{ color: "#ffffff", fontSize: "22px", fontWeight: "bold", letterSpacing: "1px" }}>🌍 AQI Monitoring</Text>
                <Button type="primary" style={{ background: "#00aaff", borderColor: "#0088cc", fontWeight: "bold", borderRadius: "20px", padding: "8px 20px", fontSize: "16px", transition: "0.3s" }} hover={{ background: "#0077bb" }}>Sign In</Button>
            </Header>
            
            {/* Content Section */}
            <Content style={{ flex: 1 }}>
                <MapContainer
                    center={defaultCenter}
                    zoom={zoomLevel}
                    style={{ height: "calc(100vh - 110px)", width: "100%", borderRadius: "10px", overflow: "hidden", border: "3px solid #00aaff" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {sensors.map((sensor) => (
                        <Marker key={sensor.id} position={[sensor.latitude, sensor.longitude]} icon={defaultIcon}>
                            <Popup>
                                <strong>{sensor.location}</strong> <br />
                                AQI: {sensor.aqiValue}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </Content>
            
            {/* Footer Section */}
            <Footer style={{ textAlign: "center", background: "#004488", padding: "10px", color: "#ffffff", fontSize: "14px", fontWeight: "bold", letterSpacing: "0.5px", borderTop: "3px solid #00aaff" }}>
                <Text>© 2025 Weather Monitoring System | Powered by Group 58  </Text>
            </Footer>
        </Layout>
    );
};

export default DesktopMapView;
