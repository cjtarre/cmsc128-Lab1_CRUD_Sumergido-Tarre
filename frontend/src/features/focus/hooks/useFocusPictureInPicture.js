import { useEffect, useRef, useState } from "react";

import { FLOAT_WIDTH, TIMER_HEIGHT, PLAYER_HEIGHT, EMBED_COMPACT_HEIGHT } from "../constants/focusPlayer";
import floatingStyles from "../styles/floatingFocus.css?raw";

function prepareWindow(pipWindow) {
    const doc = pipWindow.document;
    doc.title = "Takda Focus Mode";
    doc.documentElement.lang = document.documentElement.lang || "en";
    doc.documentElement.classList.toggle("dark", document.documentElement.classList.contains("dark"));
    const stylesheet = doc.createElement("style");
    stylesheet.textContent = floatingStyles;
    doc.documentElement.style.setProperty("--embed-compact-height", `${EMBED_COMPACT_HEIGHT}px`);
    doc.head.append(stylesheet);

    const layout = doc.createElement("main");
    const timerHost = doc.createElement("div");
    const spotifyHost = doc.createElement("div");
    layout.append(timerHost, spotifyHost);
    doc.body.append(layout);
    function resizePlayer(showPlayer) {
        try {
            pipWindow.resizeTo(FLOAT_WIDTH, showPlayer ? PLAYER_HEIGHT : TIMER_HEIGHT);
        } catch {
            // The floating window can also be resized by the user.
        }
    }

    return { timerHost, spotifyHost, resizePlayer };
}

export function useFocusPictureInPicture() {
    const supported = typeof window.documentPictureInPicture?.requestWindow === "function";
    const [floating, setFloating] = useState(null);
    const [floatError, setFloatError] = useState("");
    const instance = useRef(null);
    const pending = useRef(false);
    const mounted = useRef(false);
    const nextId = useRef(0);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            instance.current?.close();
            instance.current = null;
        };
    }, []);

    async function openFloating() {
        if (!supported || pending.current) return;
        if (instance.current && !instance.current.closed) {
            instance.current.focus();
            return;
        }

        setFloatError("");
        pending.current = true;
        let pipWindow;
        try {
            pipWindow = await window.documentPictureInPicture.requestWindow({ width: FLOAT_WIDTH, height: TIMER_HEIGHT });
            if (!mounted.current) {
                pipWindow.close();
                return;
            }

            const hosts = prepareWindow(pipWindow);
            instance.current = pipWindow;
            pipWindow.addEventListener("pagehide", () => {
                if (instance.current !== pipWindow) return;
                instance.current = null;
                if (mounted.current) setFloating(null);
            }, { once: true });
            setFloating({ id: ++nextId.current, window: pipWindow, ...hosts });
        } catch {
            pipWindow?.close();
            if (instance.current === pipWindow) instance.current = null;
            if (mounted.current) setFloatError("Couldn’t open the floating timer. You can try again.");
        } finally {
            pending.current = false;
        }
    }

    return { floating, floatError, openFloating, supported };
}
