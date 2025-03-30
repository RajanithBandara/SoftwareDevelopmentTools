import { motion } from "framer-motion";
import { useState } from "react";
import DesktopMapView from "../Pages/DesktopMap";
import AppHeader from "../Pages/DashComponents/Header.tsx";
import AppFooter from "../Pages/DashComponents/Footer.tsx";

function HomePage() {
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