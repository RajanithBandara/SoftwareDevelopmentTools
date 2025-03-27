import { motion } from "framer-motion";
import { Card } from "antd";
import React from "react";

// Page animation variants
const pageVariants = {
    initial: { opacity: 0, x: 50, scale: 0.95 },
    in: { opacity: 1, x: 0, scale: 1, transition: { delay: 0.1, duration: 0.5, ease: "easeOut" } },
    out: { opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } }
};

// Text animation variants
const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5, ease: "easeOut" } }
};

// Define the component with React.FC
const HistoricalData: React.FC = () => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
        >
            <Card
                title="Historical Data"
                className="bg-white rounded-lg shadow-lg"
                bordered={false}
            >
                <motion.p variants={textVariants} initial="hidden" animate="visible">
                    Historical charts and data visualization go here.
                </motion.p>
            </Card>
        </motion.div>
    );
};

export default HistoricalData;
