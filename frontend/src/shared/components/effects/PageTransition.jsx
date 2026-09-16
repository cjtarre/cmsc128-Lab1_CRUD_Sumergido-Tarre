import { motion } from "motion/react";

function PageTransition({ children }) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 12,
                filter: "blur(4px)",
            }}
            animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
            }}
            exit={{
                opacity: 0,
                y: -12,
                filter: "blur(4px)",
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