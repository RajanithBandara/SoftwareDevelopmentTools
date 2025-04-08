import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import DesktopMapView from "../Pages/DesktopMap";
import AppHeader from "../Pages/DashComponents/Header.tsx";
import AppFooter from "../Pages/DashComponents/Footer.tsx";
import AlertMessageSection from "./AlertMessageSection.tsx";
import { motion, AnimatePresence } from "framer-motion";

function HomePage() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);

    // Progressive loading states
    useEffect(() => {
        // First load the core UI
        const loadTimer = setTimeout(() => {
            setIsLoaded(true);
        }, 400);

        // Then show alerts after the main content appears
        const alertsTimer = setTimeout(() => {
            setShowAlerts(true);
        }, 800);

        return () => {
            clearTimeout(loadTimer);
            clearTimeout(alertsTimer);
        };
    }, []);

    // Animation variants for consistent animations
    const fadeInUp = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 overflow-hidden">
            {/* Header with enhanced animation */}
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    duration: 0.5,
                    ease: "easeOut"
                }}
                className="sticky top-0 z-50"
            >
                <AppHeader />
            </motion.div>

            {/* Alert section with animation */}
            <AnimatePresence>
                {showAlerts && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="z-30"
                    >
                        <AlertMessageSection />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content with enhanced aesthetics */}
            <motion.main
                className="flex-grow flex flex-col items-center justify-center p-4 md:p-6 relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                    opacity: isLoaded ? 1 : 0,
                    scale: isLoaded ? 1 : 0.95
                }}
                transition={{
                    duration: 0.7,
                    ease: "easeOut",
                    delay: 0.2
                }}
            >
                {/* Loading overlay */}
                <AnimatePresence>
                    {!isLoaded && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-30"
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Map container with better visual style */}
                <div className="w-full h-full md:h-[70vh] z-20 rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                    <DesktopMapView />
                </div>

                {/* Enhanced decorative elements */}
                <motion.div
                    className="absolute top-20 right-20 w-16 h-16 rounded-full bg-blue-400 opacity-20 blur-md"
                    animate={{
                        y: [0, 30, 0],
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <motion.div
                    className="absolute bottom-20 left-24 w-12 h-12 rounded-full bg-green-400 opacity-20 blur-md"
                    animate={{
                        y: [0, -20, 0],
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />

                <motion.div
                    className="absolute bottom-32 right-32 w-8 h-8 rounded-full bg-purple-400 opacity-20 blur-md"
                    animate={{
                        x: [0, -15, 0],
                        y: [0, 10, 0],
                        opacity: [0.15, 0.25, 0.15]
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
            </motion.main>

            {/* Footer with enhanced animation */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mt-auto"
            >
                <AppFooter />
            </motion.div>
        </div>

    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // Animation variants
    const pageTransition = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.2,
                duration: 0.3
            }
        }
    };

    const headerAnimation = {
        hidden: { y: -50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    const mapAnimation = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 15
            }
        },
        expanded: {
            scale: 1.02,
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
            transition: {
                type: "spring",
                stiffness: 70,
                damping: 15
            }
        }
    };

    const footerAnimation = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 50,
                damping: 10,
                delay: 0.4
            }
        }
    };

    return (
        <motion.div
            className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100"
            initial="hidden"
            animate="visible"
            variants={pageTransition}
        >
            {/* Header with shadow and glass effect */}
            <motion.div
                variants={headerAnimation}
                className="sticky top-0 z-10"
            >
                <div className="backdrop-blur-sm bg-white/80 shadow-sm">
                    <AppHeader />
                </div>
            </motion.div>

            {/* Main content with map */}
            <motion.div
                className="flex-grow p-4 md:p-8"
            >
                <motion.div
                    className="bg-white rounded-xl overflow-hidden shadow-md h-full"
                    variants={mapAnimation}
                    animate={isMapExpanded ? "expanded" : "visible"}
                    whileHover="expanded"
                    onClick={() => setIsMapExpanded(!isMapExpanded)}
                >
                    <div className="relative">
                        <DesktopMapView />
                        <motion.div
                            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md text-sm font-medium text-gray-700"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            {isMapExpanded ? "Click to reset view" : "Click to expand"}
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Footer with subtle animation */}
            <motion.div
                variants={footerAnimation}
                className="mt-auto"
            >
                <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200">
                    <AppFooter />
                </div>
            </motion.div>
        </motion.div>
    );
}

export default HomePage;