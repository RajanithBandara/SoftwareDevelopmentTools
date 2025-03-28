import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard"; // Dashboard layout with nested routes
import Register from "./pages/Register";
import Login from "./pages/Login";

// Create an authentication context to track login state
export const AuthContext = React.createContext<{
    isAuthenticated: boolean;
    setAuth: (value: boolean) => void;
}>({
    isAuthenticated: false,
    setAuth: () => {},
});

// Protected route that redirects to login if user is not authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = React.useContext(AuthContext);
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
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Nested dashboard routes under /dashboard/* */}
                    <Route
                        path="/dashboard/*"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default redirect based on authentication */}
                    <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
                    <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
                </Routes>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;
