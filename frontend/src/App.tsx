import React, { useEffect, useState, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard"; // Dashboard layout with nested routes
import Register from "./pages/Register";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/DashComponents/Admin";
import AdminProtectedRoute from "./AdminProtectedRoute";
import AllDataPage from "./Pages/AllData.tsx"; // Import the admin route protector

// Create an authentication context to track login state
export const AuthContext = createContext<{
    isAuthenticated: boolean;
    setAuth: (value: boolean) => void;
}>({
    isAuthenticated: false,
    setAuth: () => {},
});

// Generic protected route that redirects to login if not authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));

    // On load, check for token in localStorage
    useEffect(() => {
        setIsAuthenticated(!!localStorage.getItem("token"));
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setAuth: setIsAuthenticated }}>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protect the admin panel: only accessible by authenticated users with "admin" role */}
                    <Route
                        path="/admin"
                        element={
                            <AdminProtectedRoute>
                                <AdminDashboard />
                            </AdminProtectedRoute>
                        }
                    />

                    {/* Protected dashboard routes for all authenticated users */}
                    <Route
                        path="/dashboard/*"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/FullHistory"
                        element={
                            <ProtectedRoute>
                                <AllDataPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default redirect based on authentication status */}
                    <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
                </Routes>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;
