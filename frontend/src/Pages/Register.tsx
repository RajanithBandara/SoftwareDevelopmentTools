import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";

// Define role options
const roles = ["Admin", "Data Analyst", "Environmental Officer", "Viewer"];

interface FormData {
  name: string;
  email: string;
  role: string;
  password: string;
}

const Register: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({ 
    name: "", 
    email: "", 
    role: "", 
    password: "" 
  });

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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/users/register", formData);
      if (response.status === 201) {
        setMessage("Registration successful!");
      }
    } catch (error: any) {
      setMessage("Registration failed: " + (error.response?.data || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Server Status Indicator */}
        <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">Server Status</h2>
            <div className="flex items-center">
              {backendStatus === null ? (
                <div className="text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
              ) : backendStatus ? (
                <div className="text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
              ) : (
                <div className="text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
              )}
            </div>
          </div>
          {backendStatus !== null && (
            <div className={`px-6 py-3 text-sm ${backendStatus ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"}`}>
              {backendStatus ? "Connected to Server" : "Server Not Available"}
            </div>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition transform hover:shadow-xl">
          {/* Message Alert */}
          {message && (
            <div className={`p-4 text-sm ${message.includes("successful") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message}
            </div>
          )}

          <div className="px-8 pt-6 pb-8">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h1>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-no-repeat"
                  style={{ 
                    backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"%3e%3cpolyline points=\"6 9 12 15 18 9\"/%3e%3c/svg%3e')",
                    backgroundPosition: "right 0.5rem center",
                    backgroundSize: "1.5em 1.5em"
                  }}
                >
                  <option value="">Select your role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Create a strong password"
                />
              </div>
              
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account? 
              <a href="#" className="ml-1 font-medium text-sky-600 hover:text-sky-500">
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;