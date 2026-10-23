import { motion } from "motion/react";

function PageTransition({ children }) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 12,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            exit={{
                opacity: 0,
                y: -12,
            }}
            transition={{
                duration: 0.35,
                ease: "easeOut",
            }}
        >
            {children}
        </motion.div>
    );
}

export default PageTransition;