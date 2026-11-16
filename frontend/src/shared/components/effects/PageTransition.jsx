import { motion, useReducedMotion } from "motion/react";

function PageTransition({ children }) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0.92 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

export default PageTransition;
