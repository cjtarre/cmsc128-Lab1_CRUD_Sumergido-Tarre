import { useEffect, useState } from "react";

import { COMPANION_STATE } from "../companionStates";
import { COMPANION_FRAMES, COMPANION_FRAME_INTERVALS } from "../constants/companionSprites";

export function useCompanionSprite(state) {
    const [frame, setFrame] = useState(0);
    const frames = COMPANION_FRAMES[state] ?? COMPANION_FRAMES[COMPANION_STATE.IDLE];

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFrame(0);

        if (frames.length < 2) return;

        const timer = setInterval(
            () => setFrame((current) => (current + 1) % frames.length),
            COMPANION_FRAME_INTERVALS[state] ?? 500
        );

        return () => clearInterval(timer);
    }, [state, frames.length]);

    return frames[frame];
}
