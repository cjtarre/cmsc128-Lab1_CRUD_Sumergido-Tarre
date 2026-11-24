import { useTaskData } from "../tasks/context/TaskContext";
import useCompanionBehavior from "./hooks/useCompanionBehavior";
import { useCompanionSprite } from "./hooks/useCompanionSprite";
import { COMPANION_STATE } from "./companionStates";

import "./TaskCompanion.css";

export default function TaskCompanion({ userId }) {
    const { tasks, loading } = useTaskData();

    const {
        state,
        position,
        message,
        direction,
        walkDuration,
        isDragging,
        handleWalkEnd,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
    } = useCompanionBehavior(tasks, userId);

    const sprite = useCompanionSprite(state);

    if (loading) return null;

    return (
        <div
            className={`task-companion task-companion--${state}${
                isDragging ? " task-companion--dragging" : ""
            }`}
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                transitionDuration:
                    state === COMPANION_STATE.WALKING
                        ? `${walkDuration}ms`
                        : "0ms",
            }}
            onTransitionEnd={(event) => {
                if (
                    event.target === event.currentTarget &&
                    event.propertyName === "transform" &&
                    state === COMPANION_STATE.WALKING
                ) {
                    handleWalkEnd();
                }
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
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                aria-label="Interact with task companion"
            >
                <span className="task-companion__stage">
                    <img
                        src={sprite}
                        className="task-companion__sprite"
                        style={{ transform: `scaleX(${direction})` }}
                        alt=""
                        draggable="false"
                    />
                </span>
            </button>
        </div>
    );
}