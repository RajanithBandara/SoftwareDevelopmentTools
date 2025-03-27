import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // Import L properly

// Fix default icon issue in Leaflet with React
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = new L.Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Define a type for area details
interface Area {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    AQI: number;
}

// Colombo 1-15 locations with AQI data
const colomboAreas: Area[] = [
    { id: 1, name: "Colombo 1 (Fort)", latitude: 6.9339, longitude: 79.8478, AQI: 78 },
    { id: 2, name: "Colombo 2 (Slave Island)", latitude: 6.9219, longitude: 79.8577, AQI: 82 },
    { id: 3, name: "Colombo 3 (Kollupitiya)", latitude: 6.91, longitude: 79.8499, AQI: 75 },
    { id: 4, name: "Colombo 4 (Bambalapitiya)", latitude: 6.9032, longitude: 79.854, AQI: 88 },
    { id: 5, name: "Colombo 5 (Havelock Town)", latitude: 6.891, longitude: 79.8682, AQI: 91 },
    { id: 6, name: "Colombo 6 (Wellawatte)", latitude: 6.8725, longitude: 79.86, AQI: 95 },
    { id: 7, name: "Colombo 7 (Cinnamon Gardens)", latitude: 6.908, longitude: 79.8688, AQI: 72 },
    { id: 8, name: "Colombo 8 (Borella)", latitude: 6.9184, longitude: 79.8777, AQI: 85 },
    { id: 9, name: "Colombo 9 (Dematagoda)", latitude: 6.9272, longitude: 79.8791, AQI: 80 },
    { id: 10, name: "Colombo 10 (Maradana)", latitude: 6.9275, longitude: 79.8692, AQI: 89 },
    { id: 11, name: "Colombo 11 (Pettah)", latitude: 6.9374, longitude: 79.8531, AQI: 77 },
    { id: 12, name: "Colombo 12 (Hulftsdorp)", latitude: 6.9384, longitude: 79.8615, AQI: 83 },
    { id: 13, name: "Colombo 13 (Kotahena)", latitude: 6.9465, longitude: 79.8601, AQI: 92 },
    { id: 14, name: "Colombo 14 (Grandpass)", latitude: 6.9517, longitude: 79.8706, AQI: 87 },
    { id: 15, name: "Colombo 15 (Mutwal)", latitude: 6.96, longitude: 79.8678, AQI: 79 },
];

const MapView: React.FC = () => {
    const defaultCenter: [number, number] = [6.9271, 79.8612]; // Colombo, Sri Lanka
    const zoomLevel = 13;

    return (
        <MapContainer center={defaultCenter} zoom={zoomLevel} style={{ height: "80vh", width: "100%", borderRadius: "20px" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {colomboAreas.map((area) => (
                <Marker key={area.id} position={[area.latitude, area.longitude]} icon={defaultIcon}>
                    <Popup>
                        <strong>{area.name}</strong> <br />
                        AQI: {area.AQI}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapView;
