import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Fix default icon issue in Leaflet with React
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = new L.Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Define a type for sensor details, including the sensor's status.
interface Sensor {
    id: number;
    location: string;
    latitude: number;
    longitude: number;
    aqiValue: number;
    status: boolean;
}

const MapView: React.FC = () => {
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const defaultCenter: [number, number] = [6.9271, 79.8612]; // Colombo, Sri Lanka
    const zoomLevel = 13;

    useEffect(() => {
        const fetchSensors = async () => {
            try {
                // Adjust the URL if necessary
                const response = await axios.get("http://localhost:5000/api/sensors");
                // Filter to ensure only sensors that are on (status === true) are used
                const activeSensors = response.data.filter((sensor: Sensor) => sensor.status);
                setSensors(activeSensors);
            } catch (error) {
                console.error("Error fetching sensor data:", error);
            }
        };

        fetchSensors();
    }, []);

    return (
        <MapContainer
            center={defaultCenter}
            zoom={zoomLevel}
            style={{ height: "80vh", width: "100%", borderRadius: "20px" }}
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
    );
};

export default MapView;
