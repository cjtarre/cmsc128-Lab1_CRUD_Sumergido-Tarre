import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useMediaQuery } from "../../../../shared/hooks/useMediaQuery";
import ProjectCard from "./ProjectCard";
import { PROJECT_BATCH_SIZE, PROJECT_STACK_DEPTH, PROJECT_STACK_DELAY, PROJECT_DESKTOP_BREAKPOINT } from "../../constants/projectOptions";


function ProjectGrid({ projects, onEdit, onDelete, searching = false }) {
    const isDesktop = useMediaQuery(PROJECT_DESKTOP_BREAKPOINT);
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

        const timer = setTimeout(() => setExpanded(true), PROJECT_STACK_DELAY);
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
                            PROJECT_STACK_DEPTH - 1
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
                                        duration: 0.12,
                                        delay: index * 0.025,
                                    },
                                    x: {
                                        duration: 0.12,
                                        ease: [0.22, 1, 0.36, 1],
                                        delay: isDesktop
                                            ? index * 0.025
                                            : 0,
                                    },
                                    y: {
                                        duration: 0.12,
                                        ease: [0.22, 1, 0.36, 1],
                                        delay: !isDesktop
                                            ? index * 0.025
                                            : 0,
                                    },
                                    marginTop: {
                                        duration: 0.12,
                                        ease: [0.22, 1, 0.36, 1],
                                        delay:
                                            !isDesktop &&
                                            expanded &&
                                            isInitialBatch
                                                ? Math.min(
                                                    index,
                                                    PROJECT_STACK_DEPTH
                                                ) * 0.025
                                                : 0,
                                    },
                                    rotate: {
                                        duration: 0.12,
                                    },
                                    scale: {
                                        duration: 0.12,
                                    },
                                    layout: {
                                        duration: 0.12,
                                        ease: [0.22, 1, 0.36, 1],
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
