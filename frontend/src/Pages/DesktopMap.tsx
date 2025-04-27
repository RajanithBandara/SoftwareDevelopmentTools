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
