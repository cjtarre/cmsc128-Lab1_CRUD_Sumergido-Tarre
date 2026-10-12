import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { STATUS } from "../tasks/constants/taskOptions";
import {
    COMPANION_STATE,
    COMPANION_TIMING,
} from "./companionStates";
import { getRandomMessage } from "./companionMessages";

const PET_SIZE = 80;
const EDGE_PADDING = 24;
const HEADER_CLEARANCE = 88;
const MOBILE_NAV_CLEARANCE = 120;
const DRAG_THRESHOLD = 6;

const CORNER = {
    TOP_LEFT: "top-left",
    TOP_RIGHT: "top-right",
    BOTTOM_RIGHT: "bottom-right",
    BOTTOM_LEFT: "bottom-left",
};

const ADJACENT_CORNERS = {
    [CORNER.TOP_LEFT]: [
        CORNER.TOP_RIGHT,
        CORNER.BOTTOM_LEFT,
    ],
    [CORNER.TOP_RIGHT]: [
        CORNER.TOP_LEFT,
        CORNER.BOTTOM_RIGHT,
    ],
    [CORNER.BOTTOM_RIGHT]: [
        CORNER.TOP_RIGHT,
        CORNER.BOTTOM_LEFT,
    ],
    [CORNER.BOTTOM_LEFT]: [
        CORNER.TOP_LEFT,
        CORNER.BOTTOM_RIGHT,
    ],
};

function randomItem(items) {
    return items[
        Math.floor(Math.random() * items.length)
    ];
}

function randomBetween(min, max) {
    if (max <= min) return min;

    return (
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

function getBounds() {
    const right = Math.max(
        EDGE_PADDING,
        window.innerWidth - PET_SIZE - EDGE_PADDING
    );

    const bottomClearance =
        window.innerWidth < 1280
            ? MOBILE_NAV_CLEARANCE
            : EDGE_PADDING;

    const bottom = Math.max(
        HEADER_CLEARANCE,
        window.innerHeight -
            PET_SIZE -
            bottomClearance
    );

    return {
        left: EDGE_PADDING,
        right,
        top: HEADER_CLEARANCE,
        bottom,
    };
}

function getCornerPosition(corner) {
    const bounds = getBounds();

    switch (corner) {
        case CORNER.TOP_LEFT:
            return {
                x: bounds.left,
                y: bounds.top,
            };

        case CORNER.TOP_RIGHT:
            return {
                x: bounds.right,
                y: bounds.top,
            };

        case CORNER.BOTTOM_LEFT:
            return {
                x: bounds.left,
                y: bounds.bottom,
            };

        case CORNER.BOTTOM_RIGHT:
        default:
            return {
                x: bounds.right,
                y: bounds.bottom,
            };
    }
}

function getNearestCorner(position) {
    const bounds = getBounds();

    const horizontal =
        position.x <
        (bounds.left + bounds.right) / 2
            ? "left"
            : "right";

    const vertical =
        position.y <
        (bounds.top + bounds.bottom) / 2
            ? "top"
            : "bottom";

    if (vertical === "top" && horizontal === "left") {
        return CORNER.TOP_LEFT;
    }

    if (
        vertical === "top" &&
        horizontal === "right"
    ) {
        return CORNER.TOP_RIGHT;
    }

    if (
        vertical === "bottom" &&
        horizontal === "left"
    ) {
        return CORNER.BOTTOM_LEFT;
    }

    return CORNER.BOTTOM_RIGHT;
}

function clampDragPosition(x, y) {
    const bounds = getBounds();

    return {
        x: Math.min(
            bounds.right,
            Math.max(bounds.left, x)
        ),
        y: Math.min(
            bounds.bottom,
            Math.max(bounds.top, y)
        ),
    };
}

export default function useCompanionBehavior(
    tasks = []
) {
    const [state, setState] = useState(
        COMPANION_STATE.IDLE
    );

    const [corner, setCorner] = useState(
        CORNER.BOTTOM_RIGHT
    );

    const [position, setPosition] = useState(() => {
        if (typeof window === "undefined") {
            return { x: 32, y: 500 };
        }

        return getCornerPosition(
            CORNER.BOTTOM_RIGHT
        );
    });

    const [message, setMessage] = useState(
        getRandomMessage(COMPANION_STATE.IDLE)
    );

    const [isDragging, setIsDragging] =
        useState(false);

    const previousCompletedCount = useRef(null);
    const reactionTimer = useRef(null);
    const landingTimer = useRef(null);

    const dragData = useRef({
        pointerId: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        moved: false,
    });

    const completedCount = tasks.filter(
        (task) =>
            task.status === STATUS.COMPLETED
    ).length;

    const overdueCount = tasks.filter(
        (task) =>
            task.category === "overdue" &&
            task.status !== STATUS.COMPLETED
    ).length;

    const showTemporaryState = useCallback(
        (nextState) => {
            if (reactionTimer.current) {
                clearTimeout(reactionTimer.current);
            }

            setState(nextState);
            setMessage(getRandomMessage(nextState));

            reactionTimer.current = setTimeout(
                () => {
                    setState(COMPANION_STATE.IDLE);
                    setMessage(
                        getRandomMessage(
                            COMPANION_STATE.IDLE
                        )
                    );
                },
                COMPANION_TIMING.REACTION_DURATION
            );
        },
        []
    );

    useEffect(() => {
        if (previousCompletedCount.current === null) {
            previousCompletedCount.current =
                completedCount;
            return;
        }

        if (
            completedCount >
            previousCompletedCount.current
        ) {
            showTemporaryState(
                COMPANION_STATE.CELEBRATING
            );
        }

        previousCompletedCount.current =
            completedCount;
    }, [completedCount, showTemporaryState]);

    useEffect(() => {
        if (isDragging) return undefined;

        const mediaQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        if (mediaQuery.matches) return undefined;

        let timer;

        const scheduleNextBehavior = () => {
            const delay = randomBetween(
                COMPANION_TIMING.MIN_IDLE,
                COMPANION_TIMING.MAX_IDLE
            );

            timer = setTimeout(() => {
                if (isDragging) return;

                if (
                    state ===
                        COMPANION_STATE.CELEBRATING ||
                    state ===
                        COMPANION_STATE.REACTING ||
                    state ===
                        COMPANION_STATE.HELD ||
                    state ===
                        COMPANION_STATE.LANDING
                ) {
                    scheduleNextBehavior();
                    return;
                }

                const roll = Math.random();

                // Occasionally worry about overdue work.
                if (
                    overdueCount > 0 &&
                    roll < 0.08
                ) {
                    showTemporaryState(
                        COMPANION_STATE.CONCERNED
                    );
                    return;
                }

                // Sometimes take a nap.
                if (roll < 0.23) {
                    setState(
                        COMPANION_STATE.SLEEPING
                    );
                    setMessage(
                        getRandomMessage(
                            COMPANION_STATE.SLEEPING
                        )
                    );

                    timer = setTimeout(() => {
                        setState(
                            COMPANION_STATE.IDLE
                        );
                        setMessage(
                            getRandomMessage(
                                COMPANION_STATE.IDLE
                            )
                        );
                        scheduleNextBehavior();
                    }, COMPANION_TIMING.SLEEP_DURATION);

                    return;
                }

                // Only occasionally relocate.
                if (roll < 0.48) {
                    const nextCorner = randomItem(
                        ADJACENT_CORNERS[corner]
                    );

                    setCorner(nextCorner);
                    setPosition(
                        getCornerPosition(nextCorner)
                    );
                    setState(
                        COMPANION_STATE.WALKING
                    );
                    setMessage(
                        getRandomMessage(
                            COMPANION_STATE.WALKING
                        )
                    );

                    timer = setTimeout(() => {
                        setState(
                            COMPANION_STATE.IDLE
                        );
                        setMessage(
                            getRandomMessage(
                                COMPANION_STATE.IDLE
                            )
                        );
                        scheduleNextBehavior();
                    }, COMPANION_TIMING.WALK_DURATION);

                    return;
                }

                // Most cycles can simply remain idle.
                setState(COMPANION_STATE.IDLE);
                setMessage(
                    getRandomMessage(
                        COMPANION_STATE.IDLE
                    )
                );

                scheduleNextBehavior();
            }, delay);
        };

        scheduleNextBehavior();

        return () => clearTimeout(timer);
    }, [
        corner,
        isDragging,
        overdueCount,
        showTemporaryState,
        state,
    ]);

    useEffect(() => {
        const handleResize = () => {
            if (isDragging) return;

            setPosition(
                getCornerPosition(corner)
            );
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        return () =>
            window.removeEventListener(
                "resize",
                handleResize
            );
    }, [corner, isDragging]);

    useEffect(() => {
        return () => {
            if (reactionTimer.current) {
                clearTimeout(reactionTimer.current);
            }

            if (landingTimer.current) {
                clearTimeout(landingTimer.current);
            }
        };
    }, []);

    const handlePointerDown = useCallback(
        (event) => {
            if (reactionTimer.current) {
                clearTimeout(reactionTimer.current);
            }

            if (landingTimer.current) {
                clearTimeout(landingTimer.current);
            }

            event.currentTarget.setPointerCapture(
                event.pointerId
            );

            dragData.current = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                offsetX:
                    event.clientX - position.x,
                offsetY:
                    event.clientY - position.y,
                moved: false,
            };

            setIsDragging(true);
            setState(COMPANION_STATE.HELD);
            setMessage(
                getRandomMessage(
                    COMPANION_STATE.HELD
                )
            );
        },
        [position]
    );

    const handlePointerMove = useCallback(
        (event) => {
            if (
                !isDragging ||
                dragData.current.pointerId !==
                    event.pointerId
            ) {
                return;
            }

            const distance = Math.hypot(
                event.clientX -
                    dragData.current.startX,
                event.clientY -
                    dragData.current.startY
            );

            if (distance > DRAG_THRESHOLD) {
                dragData.current.moved = true;
            }

            const nextPosition = clampDragPosition(
                event.clientX -
                    dragData.current.offsetX,
                event.clientY -
                    dragData.current.offsetY
            );

            setPosition(nextPosition);
        },
        [isDragging]
    );

    const handlePointerUp = useCallback(
        (event) => {
            if (
                !isDragging ||
                dragData.current.pointerId !==
                    event.pointerId
            ) {
                return;
            }

            if (
                event.currentTarget.hasPointerCapture(
                    event.pointerId
                )
            ) {
                event.currentTarget.releasePointerCapture(
                    event.pointerId
                );
            }

            const wasDragged =
                dragData.current.moved;

            setIsDragging(false);

            if (!wasDragged) {
                showTemporaryState(
                    COMPANION_STATE.REACTING
                );
                return;
            }

            const nextCorner =
                getNearestCorner(position);

            setCorner(nextCorner);
            setPosition(
                getCornerPosition(nextCorner)
            );
            setState(COMPANION_STATE.LANDING);
            setMessage(
                getRandomMessage(
                    COMPANION_STATE.LANDING
                )
            );

            landingTimer.current = setTimeout(
                () => {
                    setState(COMPANION_STATE.IDLE);
                    setMessage(
                        getRandomMessage(
                            COMPANION_STATE.IDLE
                        )
                    );
                },
                COMPANION_TIMING.LANDING_DURATION
            );
        },
        [
            isDragging,
            position,
            showTemporaryState,
        ]
    );

    const handlePointerCancel = useCallback(
        (event) => {
            handlePointerUp(event);
        },
        [handlePointerUp]
    );

    return {
        state,
        position,
        message,
        completedCount,
        overdueCount,
        isDragging,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
    };
}
