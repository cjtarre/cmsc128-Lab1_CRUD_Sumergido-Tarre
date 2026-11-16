import { Target } from "lucide-react";
import { createPortal } from "react-dom";

function FloatingFocusTimer({ floating, countdown, phase, locked, statusMessage, taskTitle, progress, primaryLabel, onPrimary }) {
    return createPortal(
        <section className="focus-timer">
            <div className="focus-heading">
                <Target size={14} aria-hidden="true" />
                <h1>{phase === "focus" ? "Focus timer" : "Break timer"}</h1>
            </div>
            <div className="focus-time">
                <p className="focus-countdown" role="timer" aria-label="Time remaining">{countdown}</p>
                <div aria-hidden="true" className="focus-meter">
                    <span style={{ width: `${progress * 100}%` }} />
                </div>
                <p className="focus-status" role="status">{locked ? "Locked until the timer ends" : statusMessage}</p>
            </div>
            {taskTitle && <p className="focus-task" title={taskTitle}>{taskTitle}</p>}
            {!locked && <button type="button" className="focus-primary" onClick={onPrimary}>{primaryLabel}</button>}
        </section>,
        floating.timerHost
    );
}

export default FloatingFocusTimer;
