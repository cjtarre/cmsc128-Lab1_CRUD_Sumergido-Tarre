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

const FRAMES = {
    [COMPANION_STATE.IDLE]: [idle1, idle2],
    [COMPANION_STATE.WALKING]: [walk1, walk2, walk3, walk4, walk5],
    [COMPANION_STATE.SLEEPING]: [sleeping],
    [COMPANION_STATE.CELEBRATING]: [celebrate1, celebrate2],
    [COMPANION_STATE.CONCERNED]: [concerned],
    [COMPANION_STATE.REACTING]: [reacting],
    [COMPANION_STATE.HELD]: [held1, held2],
    [COMPANION_STATE.LANDING]: [landing1, landing2],
};

const SPEED = {
    idle: 1200,
    walking: 280,
    celebrating: 300,
    held: 350,
    landing: 250,
};

export default function TaskCompanion() {
    const { tasks, loading } = useTaskData();
    const behavior = useCompanionBehavior(tasks);
    const { state, position, message, direction, isDragging } = behavior;
    const [frame, setFrame] = useState(0);

    const frames = FRAMES[state] ?? FRAMES[COMPANION_STATE.IDLE];

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFrame(0);

        if (frames.length < 2) return;

        const timer = setInterval(
            () => setFrame((i) => (i + 1) % frames.length),
            SPEED[state] ?? 500
        );

        return () => clearInterval(timer);
    }, [state, frames.length]);

    if (loading) return null;

    return (
        <div
            className={`task-companion task-companion--${state}${
                isDragging ? " task-companion--dragging" : ""
            }`}
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
        >
            {message && (
                <div className="task-companion__message" role="status">
                    {message}
                </div>
            )}

            <button
                type="button"
                className="task-companion__pet"
                onPointerDown={behavior.handlePointerDown}
                onPointerMove={behavior.handlePointerMove}
                onPointerUp={behavior.handlePointerUp}
                onPointerCancel={behavior.handlePointerCancel}
                aria-label="Interact with task companion"
            >
                <div className="task-companion__stage">
                    <img
                        src={frames[frame]}
                        className="task-companion__sprite"
                        style={{
                            transform: `scaleX(${direction})`,
                        }}
                        alt=""
                        draggable="false"
                    />
                </div>
            </button>
        </div>
    );
}