import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./App"; // Adjust the path if needed

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const userRole = localStorage.getItem("userRole")?.toLowerCase();

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If the user role is not admin, redirect to dashboard
    if (userRole !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    // Otherwise, render the child component(s)
    return <>{children}</>;
};

export default AdminProtectedRoute;
