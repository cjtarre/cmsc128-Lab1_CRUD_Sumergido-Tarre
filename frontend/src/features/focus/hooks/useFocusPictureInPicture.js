import { useEffect, useRef, useState } from "react";

const FLOAT_WIDTH = 360;
const TIMER_HEIGHT = 240;
const PLAYER_HEIGHT = 405;

const floatingStyles = `
    :root {
        color-scheme: light;
        --background: #e7f3ec;
        --panel: #f8fcf9;
        --timer: #ecf8f0;
        --text: #192c25;
        --muted: #486158;
        --accent: #075b3b;
        --border: #c7dfd2;
        --track: #d6e9de;
        --primary: #095f41;
        --primary-hover: #074b33;
        --primary-text: #fff;
    }
    :root.dark {
        color-scheme: dark;
        --background: #111b17;
        --panel: #1c2923;
        --timer: #192e24;
        --text: #f1f8f4;
        --muted: #b3c9bd;
        --accent: #9ae6bf;
        --border: #365044;
        --track: #304a3e;
        --primary: #a2e9c4;
        --primary-hover: #baf2d5;
        --primary-text: #123024;
    }
    * { box-sizing: border-box; }
    body {
        margin: 0;
        background: var(--background);
        color: var(--text);
        font: 13px/1.35 system-ui, sans-serif;
    }
    main { display: grid; gap: 8px; padding: 10px; }
    main > div:empty { display: none; }
    h1, p { margin: 0; }
    h1 { font-size: 12px; font-weight: 650; }
    .focus-timer, .focus-spotify {
        min-width: 0;
        border: 1px solid var(--border);
        border-radius: 13px;
    }
    .focus-timer {
        display: grid;
        gap: 6px;
        padding: 9px 12px 10px;
        background: linear-gradient(145deg, var(--panel), var(--timer));
    }
    .focus-heading, .focus-track-header {
        display: flex;
        align-items: center;
        gap: 7px;
    }
    .focus-heading svg, .focus-track-header > svg { flex: none; color: var(--accent); }
    .focus-time { display: grid; justify-items: center; gap: 4px; text-align: center; }
    .focus-countdown {
        color: var(--accent);
        font-size: clamp(35px, 15vw, 57px);
        font-weight: 670;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        letter-spacing: -.045em;
    }
    .focus-meter {
        width: min(74%, 184px);
        height: 3px;
        margin-top: 2px;
        overflow: hidden;
        border-radius: 999px;
        background: var(--track);
    }
    .focus-meter > span { display: block; height: 100%; background: var(--accent); }
    .focus-status { color: var(--muted); font-size: 11px; }
    .focus-task, .focus-track-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .focus-task {
        justify-self: center;
        max-width: 100%;
        font-size: 12px;
        font-weight: 550;
    }
    .focus-spotify {
        display: grid;
        gap: 7px;
        padding: 7px;
        background: var(--panel);
    }
    .focus-track-header { min-width: 0; padding-inline: 2px; }
    .focus-track-title { flex: 1; font-size: 11px; font-weight: 600; }
    .focus-spotify {
        container-type: inline-size;
        grid-template-columns: minmax(0, 1fr);
        overflow: clip;
    }

    .focus-spotify iframe {
        display: block;
        width: 100%;
        border: 0;
        border-radius: 8px;
    }

    @supports (scale: calc(1px / 1px)) {
        @container (width < 280px) {
            .focus-spotify iframe {
                --player-scale: calc(100cqi / 280px);
                width: 280px;
                transform-origin: top left;
                scale: var(--player-scale);
                margin-bottom: calc(152px * (var(--player-scale) - 1));
            }
        }
    }
    button {
        appearance: none;
        border: 1px solid var(--border);
        border-radius: 7px;
        padding: 4px 8px;
        background: transparent;
        color: var(--text);
        font: inherit;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
    }
    button:hover { background: var(--timer); }
    button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    .focus-primary {
        justify-self: center;
        border-color: transparent;
        background: var(--primary);
        color: var(--primary-text);
        padding-inline: 13px;
    }
    .focus-primary:hover { background: var(--primary-hover); }
    .focus-player-action { flex: none; white-space: nowrap; }
`;

function prepareWindow(pipWindow) {
    const doc = pipWindow.document;
    doc.title = "Takda Focus Mode";
    doc.documentElement.lang = document.documentElement.lang || "en";
    doc.documentElement.classList.toggle("dark", document.documentElement.classList.contains("dark"));
    const stylesheet = doc.createElement("style");
    stylesheet.textContent = floatingStyles;
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
