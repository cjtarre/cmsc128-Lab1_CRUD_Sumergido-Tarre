import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { lookupFocusPlaylistName } from "../services/focusPlaylistService";
import { focusControlStyle } from "../styles/focusControlStyle";
import { getSpotifyPlaylistId } from "../utils/spotifyPlaylist";

const fieldClass = "h-9 w-full min-w-0 rounded-lg border border-white/75 bg-white/55 px-2.5 text-slate-800 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-400";

function FocusPlaylistForm({ saving, onSave, onCancel }) {
    const [link, setLink] = useState("");
    const [manualTitle, setManualTitle] = useState(null);
    const [lookup, setLookup] = useState(null);
    const id = getSpotifyPlaylistId(link);

    useEffect(() => {
        if (!id || manualTitle !== null) return;
        const controller = new AbortController();
        const delay = window.setTimeout(() => {
            lookupFocusPlaylistName(id, controller.signal).then((name) => {
                if (!controller.signal.aborted) setLookup({ id, name });
            }).catch(() => {
                if (!controller.signal.aborted) setLookup({ id, name: "" });
            });
        }, 250);
        return () => {
            window.clearTimeout(delay);
            controller.abort();
        };
    }, [id, manualTitle]);

    const detectedTitle = lookup?.id === id ? lookup.name : "";
    const lookupFailed = id && lookup?.id === id && !detectedTitle;
    const showTitleField = manualTitle !== null || lookupFailed;
    const title = (manualTitle ?? detectedTitle).trim();

    function changeLink(event) {
        const next = event.target.value;
        if (getSpotifyPlaylistId(next) !== id) {
            setManualTitle(null);
            setLookup(null);
        }
        setLink(next);
    }

    function submit(event) {
        event.preventDefault();
        if (id && title && !saving) onSave(id, title);
    }

    return (
        <form className="mt-3 space-y-2" onSubmit={submit}>
            <div className="flex items-center gap-2">
                <input name="link" aria-label="Spotify playlist link" placeholder="Paste a Spotify playlist link"
                    className={fieldClass} style={focusControlStyle} value={link} onChange={changeLink}
                    inputMode="url" disabled={saving} required />
                <button type="submit" disabled={saving || !id || !title} style={focusControlStyle}
                    className="h-9 shrink-0 rounded-lg bg-green-700 px-3 font-semibold text-white hover:bg-green-800 disabled:opacity-45 dark:bg-green-400 dark:text-slate-950">
                    Save
                </button>
            </div>

            {link && !id && <p className="text-xs text-slate-600 dark:text-slate-400">Paste a Spotify playlist share link.</p>}
            {id && !showTitleField && !detectedTitle && <p role="status" className="text-xs text-slate-600 dark:text-slate-400">Finding playlist title…</p>}
            {detectedTitle && !showTitleField && (
                <div className="flex items-center gap-2 rounded-lg bg-white/40 py-1 pr-1 pl-2.5 dark:bg-white/[0.06]">
                    <p className="min-w-0 flex-1 truncate text-xs font-medium" title={detectedTitle}>{detectedTitle}</p>
                    <button type="button" aria-label="Clear detected title and enter your own" title="Use a different title"
                        disabled={saving} style={focusControlStyle} onClick={() => setManualTitle("")}
                        className="grid size-7 shrink-0 place-items-center rounded-md text-slate-600 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-white/10">
                        <X size={14} aria-hidden="true" />
                    </button>
                </div>
            )}
            {showTitleField && (
                <input name="name" aria-label="Playlist title" placeholder="Enter a playlist title"
                    className={fieldClass} style={focusControlStyle} maxLength={60} value={manualTitle ?? ""}
                    onChange={(event) => setManualTitle(event.target.value)} disabled={saving} required />
            )}
            <button type="button" disabled={saving} onClick={onCancel} style={focusControlStyle}
                className="rounded-md px-1 py-1 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200">
                Cancel
            </button>
        </form>
    );
}

export default FocusPlaylistForm;
