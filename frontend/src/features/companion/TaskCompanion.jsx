import { useEffect, useState } from "react";

import { useTaskData } from "../tasks/context/TaskContext";
import useCompanionBehavior from "./useCompanionBehavior";
import { COMPANION_STATE } from "./companionStates";

import idle1 from "./assets/pet/idle_1.png";
import idle2 from "./assets/pet/idle_2.png";

import walk1 from "./assets/pet/walk_1.png";
import walk2 from "./assets/pet/walk_2.png";
import walk3 from "./assets/pet/walk_3.png";
import walk4 from "./assets/pet/walk_4.png";
import walk5 from "./assets/pet/walk_5.png";

import sleeping from "./assets/pet/sleeping.png";

import celebrate1 from "./assets/pet/celebrate_1.png";
import celebrate2 from "./assets/pet/celebrate_2.png";

import concerned from "./assets/pet/concerned.png";
import reacting from "./assets/pet/reacting.png";

import held1 from "./assets/pet/held_1.png";
import held2 from "./assets/pet/held_2.png";

import landing1 from "./assets/pet/landing_1.png";
import landing2 from "./assets/pet/landing_2.png";

import "./TaskCompanion.css";

const PET_FRAMES = {
    [COMPANION_STATE.IDLE]: [
        idle1,
        idle2,
    ],

    [COMPANION_STATE.WALKING]: [
        walk1,
        walk2,
        walk3,
        walk4,
        walk5,
    ],

    [COMPANION_STATE.SLEEPING]: [
        sleeping,
    ],

    [COMPANION_STATE.CELEBRATING]: [
        celebrate1,
        celebrate2,
    ],

    [COMPANION_STATE.CONCERNED]: [
        concerned,
    ],

    [COMPANION_STATE.REACTING]: [
        reacting,
    ],

    [COMPANION_STATE.HELD]: [
        held1,
        held2,
    ],

    [COMPANION_STATE.LANDING]: [
        landing1,
        landing2,
    ],
};

const FRAME_SPEED = {
    [COMPANION_STATE.IDLE]: 1200,
    [COMPANION_STATE.WALKING]: 180,
    [COMPANION_STATE.CELEBRATING]: 300,
    [COMPANION_STATE.HELD]: 350,
    [COMPANION_STATE.LANDING]: 250,
};

function TaskCompanion() {
    const { tasks, loading } = useTaskData();

    const {
        state,
        position,
        message,
        isDragging,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
    } = useCompanionBehavior(tasks);

    const [frameIndex, setFrameIndex] = useState(0);

    const frames =
        PET_FRAMES[state] ??
        PET_FRAMES[COMPANION_STATE.IDLE];

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFrameIndex(0);

        if (frames.length <= 1) {
            return undefined;
        }

        const speed =
            FRAME_SPEED[state] ?? 500;

        const interval = setInterval(() => {
            setFrameIndex(
                (current) =>
                    (current + 1) % frames.length
            );
        }, speed);

        return () => clearInterval(interval);
    }, [state, frames.length]);

    if (loading) return null;

    return (
        <div
            className={[
                "task-companion",
                `task-companion--${state}`,
                isDragging
                    ? "task-companion--dragging"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
        >
            {message && (
                <div
                    className="task-companion__message"
                    role="status"
                    aria-live="polite"
                >
                    {message}
                </div>
            )}

            <button
                type="button"
                className="task-companion__pet"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={
                    handlePointerCancel
                }
                aria-label="Interact with your task companion"
                title="Grab me!"
            >
                <img
                    className="task-companion__sprite"
                    src={frames[frameIndex]}
                    alt=""
                    draggable="false"
                />
            </button>
        </div>
    );
}

export default TaskCompanion;