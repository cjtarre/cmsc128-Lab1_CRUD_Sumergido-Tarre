import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import ProjectCard from "./ProjectCard";

const PROJECT_BATCH_SIZE = 12;
const STACK_DEPTH = 4;
const STACK_DELAY = 500;
const DESKTOP_BREAKPOINT = "(min-width: 640px)";

// Track the Tailwind sm breakpoint for direction-specific Motion animations.
function useDesktopView() {
    const [isDesktop, setIsDesktop] = useState(() =>
        typeof window !== "undefined"
            ? window.matchMedia(DESKTOP_BREAKPOINT).matches
            : false
    );

    useEffect(() => {
        const media = window.matchMedia(DESKTOP_BREAKPOINT);
        const handleChange = (event) => setIsDesktop(event.matches);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsDesktop(media.matches);
        media.addEventListener("change", handleChange);

        return () => media.removeEventListener("change", handleChange);
    }, []);

    return isDesktop;
}

function ProjectGrid({ projects, onEdit, onDelete, searching = false }) {
    const isDesktop = useDesktopView();
    const [expanded, setExpanded] = useState(false);
    const [visibleCount, setVisibleCount] = useState(PROJECT_BATCH_SIZE);

    // Mobile briefly stacks the first cards, then opens them downward.
    useEffect(() => {
        if (isDesktop || searching) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setExpanded(true);
            return;
        }

        setExpanded(false);

        const timer = setTimeout(() => setExpanded(true), STACK_DELAY);
        return () => clearTimeout(timer);
    }, [projects.length, searching, isDesktop]);

    // Reset batching after leaving search.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!searching) setVisibleCount(PROJECT_BATCH_SIZE);
    }, [searching]);

    const visibleProjects = searching
        ? projects
        : projects.slice(0, visibleCount);

    const remainingCount = Math.max(
        projects.length - visibleProjects.length,
        0
    );

    const nextBatchCount = Math.min(
        PROJECT_BATCH_SIZE,
        remainingCount
    );

    return (
        <div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(300px,380px))] sm:gap-3">
                <AnimatePresence initial>
                    {visibleProjects.map((project, index) => {
                        const isInitialBatch = index < PROJECT_BATCH_SIZE;

                        const stackIndex = Math.min(
                            index,
                            STACK_DEPTH - 1
                        );

                        const isMobileStacked =
                            !isDesktop &&
                            !searching &&
                            !expanded &&
                            isInitialBatch;

                        // Desktop enters horizontally; mobile enters vertically.
                        const initialPosition = isDesktop
                            ? { opacity: 0, x: -24, y: 0 }
                            : { opacity: 0, x: 0, y: -16 };

                        return (
                            <motion.div
                                key={project.id}
                                layout
                                initial={initialPosition}
                                animate={{
                                    opacity: 1,
                                    x: isMobileStacked
                                        ? stackIndex * 3
                                        : 0,
                                    y: 0,
                                    rotate:
                                        isMobileStacked && stackIndex > 0
                                            ? stackIndex % 2
                                                ? 0.7
                                                : -0.5
                                            : 0,
                                    scale: isMobileStacked
                                        ? 1 - stackIndex * 0.018
                                        : 1,
                                    marginTop:
                                        isMobileStacked && index > 0
                                            ? -102
                                            : 0,
                                }}
                                exit={
                                    isDesktop
                                        ? { opacity: 0, x: 18 }
                                        : { opacity: 0, y: 12 }
                                }
                                transition={{
                                    opacity: {
                                        duration: 0.2,
                                        delay: index * 0.055,
                                    },
                                    x: {
                                        type: "spring",
                                        stiffness: 240,
                                        damping: 25,
                                        delay: isDesktop
                                            ? index * 0.055
                                            : 0,
                                    },
                                    y: {
                                        type: "spring",
                                        stiffness: 240,
                                        damping: 25,
                                        delay: !isDesktop
                                            ? index * 0.055
                                            : 0,
                                    },
                                    marginTop: {
                                        type: "spring",
                                        stiffness: 210,
                                        damping: 24,
                                        delay:
                                            !isDesktop &&
                                            expanded &&
                                            isInitialBatch
                                                ? Math.min(
                                                    index,
                                                    STACK_DEPTH
                                                ) * 0.06
                                                : 0,
                                    },
                                    rotate: {
                                        duration: 0.25,
                                    },
                                    scale: {
                                        duration: 0.25,
                                    },
                                    layout: {
                                        type: "spring",
                                        stiffness: 240,
                                        damping: 28,
                                    },
                                }}
                                style={{
                                    zIndex: isMobileStacked
                                        ? visibleProjects.length - index
                                        : 1,
                                }}
                            >
                                <ProjectCard
                                    project={project}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Reveal additional projects in batches. */}
            {!searching && remainingCount > 0 && (
                <motion.div
                    layout
                    className="mt-3 flex justify-center sm:mt-4"
                >
                    <button
                        type="button"
                        onClick={() =>
                            setVisibleCount((count) =>
                                Math.min(
                                    count + PROJECT_BATCH_SIZE,
                                    projects.length
                                )
                            )
                        }
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3.5 font-semibold text-slate-500 transition hover:bg-white/50 hover:text-green-600 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-green-400"
                        style={{
                            fontSize: "11px",
                            lineHeight: "1",
                        }}
                    >
                        <ChevronDown size={13} />

                        {remainingCount <= PROJECT_BATCH_SIZE
                            ? `Show remaining ${remainingCount}`
                            : `Show ${nextBatchCount} more`}
                    </button>
                </motion.div>
            )}
        </div>
    );
}

export default ProjectGrid;
