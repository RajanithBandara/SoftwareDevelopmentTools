import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const roles = ["Admin", "Data Analyst", "Environmental Officer", "Viewer"];

const Register = () => {
    const [backendStatus, setBackendStatus] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", role: "", password: "" });

    useEffect(() => {
        const checkBackendConnection = async () => {
            try {
                await axios.get("http://localhost:5000/api/health");
                setBackendStatus(true);
            } catch {
                setBackendStatus(false);
            }
        };
        checkBackendConnection();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/api/users/register", formData);
            if (response.status === 201) {
                setMessage("✅ Registration successful!");
            }
        } catch (error) {
            setMessage("❌ Registration failed: " + (error.response?.data || error.message));
        }
        setLoading(false);
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f0f2f5", padding: "20px" }}>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: "100%", maxWidth: "420px", background: "white", padding: "24px", borderRadius: "8px", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)" }}>
                {backendStatus !== null && (
                    <div style={{ marginBottom: "1rem", padding: "10px", background: backendStatus ? "#d4edda" : "#f8d7da", color: backendStatus ? "#155724" : "#721c24", borderRadius: "4px" }}>
                        {backendStatus ? "✅ Connected to Server" : "❌ Server Not Available"}
                    </div>
                )}
                {message && (
                    <div style={{ marginBottom: "1rem", padding: "10px", background: "#f8d7da", color: "#721c24", borderRadius: "4px" }}>
                        {message}
                    </div>
                )}
                <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Register</h3>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} />
                    <select name="role" value={formData.role} onChange={handleChange} required style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}>
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} />
                    <button type="submit" disabled={loading} style={{ padding: "10px", background: "#1890ff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;