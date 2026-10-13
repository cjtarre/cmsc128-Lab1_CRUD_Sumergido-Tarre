import { useCallback, useEffect, useRef, useState } from "react";

import { STATUS } from "../tasks/constants/taskOptions";
import { COMPANION_STATE, COMPANION_TIMING } from "./companionStates";
import { getRandomMessage } from "./companionMessages";

const PET_SIZE = 88;
const EDGE = 24;
const DRAG_THRESHOLD = 6;
const POSITION_KEY = "takda-companion-x";

const random = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

function getBounds() {
    const desktopNav = document.getElementById("desktop-navbar");
    const mobileNav = document.getElementById("mobile-navbar");

    const desktopRect = desktopNav?.getBoundingClientRect();
    const mobileRect = mobileNav?.getBoundingClientRect();

    const navRight = desktopRect?.width > 0 ? desktopRect.right : 0;

    const mobileTop =
        mobileRect?.height > 0
            ? mobileRect.top
            : window.innerHeight;

    const left = navRight + EDGE;
    const right = Math.max(
        left,
        window.innerWidth - PET_SIZE - EDGE
    );

    const groundY = Math.max(
        EDGE,
        mobileTop - PET_SIZE - EDGE
    );

    return { left, right, groundY };
}

function clampX(x) {
    const { left, right } = getBounds();
    return Math.min(right, Math.max(left, x));
}

function getHome() {
    const { right, groundY } = getBounds();
    return { x: right, y: groundY };
}

function getSavedPosition() {
    const saved = Number(localStorage.getItem(POSITION_KEY));
    const { groundY } = getBounds();

    return {
        x:
            localStorage.getItem(POSITION_KEY) !== null
                ? clampX(saved)
                : getHome().x,
        y: groundY,
    };
}

function savePosition({ x }) {
    localStorage.setItem(POSITION_KEY, String(x));
}

function snapToGround({ x }) {
    const { groundY } = getBounds();

    return {
        x: clampX(x),
        y: groundY,
    };
}

function clampDrag(x, y) {
    const { left, right, groundY } = getBounds();

    return {
        x: Math.min(right, Math.max(left, x)),
        y: Math.min(groundY, Math.max(EDGE, y)),
    };
}

function getRandomSpot(currentX) {
    const { left, right, groundY } = getBounds();
    const width = right - left;

    const spots = [0.1, 0.3, 0.5, 0.7, 0.9]
        .map((ratio) => ({
            x: left + width * ratio,
            y: groundY,
        }))
        .filter(
            (spot) =>
                Math.abs(spot.x - currentX) > width * 0.12
        );

    return (
        spots[Math.floor(Math.random() * spots.length)] ??
        getHome()
    );
}

export default function useCompanionBehavior(tasks = []) {
    const [state, setState] = useState(COMPANION_STATE.IDLE);

    const [position, setPosition] = useState(() =>
        typeof window === "undefined"
            ? { x: 900, y: 600 }
            : getSavedPosition()
    );

    const [message, setMessage] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [direction, setDirection] = useState(1);
    const [walkDuration, setWalkDuration] = useState(4000);

    const positionRef = useRef(position);
    const previousTaskStatuses = useRef(null);
    const reactionTimer = useRef(null);
    const landingTimer = useRef(null);
    const drag = useRef({});

    const completedCount = tasks.filter(
        (task) => task.status === STATUS.COMPLETED
    ).length;

    const overdueCount = tasks.filter(
        (task) =>
            task.category === "overdue" &&
            task.status !== STATUS.COMPLETED
    ).length;

    const react = useCallback((nextState) => {
        clearTimeout(reactionTimer.current);

        setState(nextState);
        setMessage(getRandomMessage(nextState));

        reactionTimer.current = setTimeout(() => {
            setState(COMPANION_STATE.IDLE);
            setMessage("");
        }, COMPANION_TIMING.REACTION_DURATION);
    }, []);

    // Keep the latest position without restarting ambient behavior.
    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    // Save resting X position.
    useEffect(() => {
        if (!isDragging) {
            savePosition(position);
        }
    }, [position, isDragging]);

    // Celebrate only when an existing task becomes completed.
    useEffect(() => {
        const currentStatuses = new Map(
            tasks.map((task) => [task.id, task.status])
        );

        // Initial load should not trigger celebration.
        if (previousTaskStatuses.current === null) {
            previousTaskStatuses.current = currentStatuses;
            return;
        }

        const taskWasCompleted = tasks.some((task) => {
            const previousStatus =
                previousTaskStatuses.current.get(task.id);

            return (
                previousStatus !== undefined &&
                previousStatus !== STATUS.COMPLETED &&
                task.status === STATUS.COMPLETED
            );
        });

        previousTaskStatuses.current = currentStatuses;

        if (taskWasCompleted) {
            react(COMPANION_STATE.CELEBRATING);
        }
    }, [tasks, react]);

    // Ambient behavior.
    useEffect(() => {
        if (
            isDragging ||
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            return;
        }

        let timer;

        const schedule = () => {
            timer = setTimeout(() => {
                if (isDragging) return;

                // Do not interrupt active reactions.
                if (
                    [
                        COMPANION_STATE.WALKING,
                        COMPANION_STATE.SLEEPING,
                        COMPANION_STATE.CELEBRATING,
                        COMPANION_STATE.CONCERNED,
                        COMPANION_STATE.REACTING,
                        COMPANION_STATE.HELD,
                        COMPANION_STATE.LANDING,
                    ].includes(state)
                ) {
                    return;
                }

                const roll = Math.random();

                // Occasionally react to overdue tasks.
                if (overdueCount && roll < 0.08) {
                    react(COMPANION_STATE.CONCERNED);
                    return;
                }

                // Sleep.
                if (roll < 0.25) {
                    setState(COMPANION_STATE.SLEEPING);
                    setMessage(
                        Math.random() < 0.5
                            ? getRandomMessage(COMPANION_STATE.SLEEPING)
                            : ""
                    );

                    timer = setTimeout(() => {
                        setState(COMPANION_STATE.IDLE);
                        setMessage("");
                    }, COMPANION_TIMING.SLEEP_DURATION);

                    return;
                }

                // Walk.
                if (roll < 0.5) {
                    const current = positionRef.current;
                    const next = getRandomSpot(current.x);

                    const distance = Math.abs(next.x - current.x);

                    // Constant-ish walking speed.
                    const duration = Math.max(1800, distance * 8);

                    // Walking PNGs face right by default.
                    setDirection(next.x < current.x ? -1 : 1);
                    setWalkDuration(duration);
                    setState(COMPANION_STATE.WALKING);

                    setMessage(
                        Math.random() < 0.35
                            ? getRandomMessage(COMPANION_STATE.WALKING)
                            : ""
                    );

                    // First render WALKING + direction,
                    // then begin physical movement.
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            setPosition(next);
                        });
                    });

                    return;
                }

                // Remain idle.
                setState(COMPANION_STATE.IDLE);
                setMessage(
                    Math.random() < 0.3
                        ? getRandomMessage(COMPANION_STATE.IDLE)
                        : ""
                );

            }, random(
                COMPANION_TIMING.MIN_IDLE,
                COMPANION_TIMING.MAX_IDLE
            ));
        };

        schedule();

        return () => clearTimeout(timer);
    }, [isDragging, overdueCount, react, state]);

    // CSS travel finished -> stop walking immediately.
    const handleWalkEnd = useCallback(() => {
        setState((current) =>
            current === COMPANION_STATE.WALKING
                ? COMPANION_STATE.IDLE
                : current
        );

        setMessage("");
    }, []);

    // React to viewport/navbar size changes.
    useEffect(() => {
        const desktopNav =
            document.getElementById("desktop-navbar");

        const mobileNav =
            document.getElementById("mobile-navbar");

        const update = () =>
            setPosition((current) =>
                snapToGround(current)
            );

        const observer = new ResizeObserver(update);

        if (desktopNav) {
            observer.observe(desktopNav);
        }

        if (mobileNav) {
            observer.observe(mobileNav);
        }

        window.addEventListener("resize", update);

        requestAnimationFrame(update);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", update);
        };
    }, []);

    // Cleanup reaction/landing timers.
    useEffect(
        () => () => {
            clearTimeout(reactionTimer.current);
            clearTimeout(landingTimer.current);
        },
        []
    );

    const handlePointerDown = useCallback(
        (event) => {
            clearTimeout(reactionTimer.current);
            clearTimeout(landingTimer.current);

            event.currentTarget.setPointerCapture(
                event.pointerId
            );

            drag.current = {
                id: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                offsetX: event.clientX - position.x,
                offsetY: event.clientY - position.y,
                moved: false,
            };

            setIsDragging(true);
            setState(COMPANION_STATE.HELD);

            setMessage(
                Math.random() < 0.35
                    ? getRandomMessage(
                          COMPANION_STATE.HELD
                      )
                    : ""
            );
        },
        [position]
    );

    const handlePointerMove = useCallback(
        (event) => {
            if (
                !isDragging ||
                drag.current.id !== event.pointerId
            ) {
                return;
            }

            if (
                Math.hypot(
                    event.clientX - drag.current.startX,
                    event.clientY - drag.current.startY
                ) > DRAG_THRESHOLD
            ) {
                drag.current.moved = true;
            }

            setPosition(
                clampDrag(
                    event.clientX - drag.current.offsetX,
                    event.clientY - drag.current.offsetY
                )
            );
        },
        [isDragging]
    );

    const handlePointerUp = useCallback(
        (event) => {
            if (
                !isDragging ||
                drag.current.id !== event.pointerId
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

            const moved = drag.current.moved;

            setIsDragging(false);

            // Click without dragging.
            if (!moved) {
                react(COMPANION_STATE.REACTING);
                return;
            }

            // Dragged pet returns to floor.
            setPosition((current) => {
                const landed = snapToGround(current);
                savePosition(landed);
                return landed;
            });

            setState(COMPANION_STATE.LANDING);
            setMessage(
                Math.random() < 0.5
                    ? getRandomMessage(COMPANION_STATE.LANDING)
                    : ""
            );

            landingTimer.current = setTimeout(() => {setState(COMPANION_STATE.IDLE); setMessage("")
            }, COMPANION_TIMING.LANDING_DURATION);
        }, [isDragging, react]
    );

    return {
        state,
        position,
        message,
        direction,
        walkDuration,
        completedCount,
        overdueCount,
        isDragging,
        handleWalkEnd,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel: handlePointerUp,
    };
}