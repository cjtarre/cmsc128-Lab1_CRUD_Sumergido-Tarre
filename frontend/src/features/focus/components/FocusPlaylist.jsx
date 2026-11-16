import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, Music2, Plus } from "lucide-react";

import { getFocusPlaylists, updateFocusPlaylist } from "../services/focusPlaylistService";
import { readFocusValue, writeFocusValue } from "../utils/focusSessionStorage";
import { focusControlStyle } from "../utils/focusControlStyle";
import FocusPlaylistForm from "./FocusPlaylistForm";
import FocusSelect from "./FocusSelect";

const initialBrowserPlaylist = (key) => {
    const id = readFocusValue("localStorage", key, null);
    return typeof id === "string" && /^[a-zA-Z0-9]{22}$/.test(id) && id.length === 22 ? id : null;
};

function FocusPlaylist({ className, storageKey, initialPlaylistId, floating, locked }) {
    const activeKey = `${storageKey}:active`;
    const [browserId, setBrowserId] = useState(() => initialBrowserPlaylist(storageKey));
    const [playlists, setPlaylists] = useState([]);
    const [selectedId, setSelectedId] = useState(() => initialPlaylistId ?? readFocusValue("localStorage", activeKey, null));
    const [loadState, setLoadState] = useState("loading");
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [adding, setAdding] = useState(false);
    const [playerWindowId, setPlayerWindowId] = useState(null);

    const choices = browserId && !playlists.some(({ id }) => id === browserId)
        ? [{ id: browserId, name: "Browser playlist", browserOnly: true }, ...playlists]
        : playlists;
    const selected = choices.find(({ id }) => id === selectedId) ?? choices[0];
    const playerIsFloating = Boolean(floating && floating.id === playerWindowId);
    const playerHeight = !playerIsFloating && (locked || expanded) ? 352 : 152;
    const canManage = !locked && loadState === "ready";

    useEffect(() => {
        const controller = new AbortController();
        getFocusPlaylists(controller.signal).then((saved) => {
            if (controller.signal.aborted) return;
            setPlaylists(saved);
            const localId = initialBrowserPlaylist(storageKey);
            if (localId && saved.some(({ id }) => id === localId)) {
                writeFocusValue("localStorage", storageKey, null);
                setBrowserId(null);
            }
            setLoadState("ready");
        }).catch(() => {
            if (!controller.signal.aborted) setLoadState("failed");
        });
        return () => controller.abort();
    }, [loadAttempt, storageKey]);

    function selectPlaylist(id) {
        setSelectedId(id);
        writeFocusValue("localStorage", activeKey, id);
    }

    async function savePlaylist(id, name) {
        if (!canManage || saving) return;
        setSaving(true);
        setError("");
        try {
            const saved = await updateFocusPlaylist(id, name);
            setPlaylists(saved);
            if (id === browserId) {
                writeFocusValue("localStorage", storageKey, null);
                setBrowserId(null);
            }
            selectPlaylist(name === null ? saved[0]?.id ?? null : id);
            setAdding(false);
        } catch (requestError) {
            setError(requestError.response?.data?.error ?? "Could not update your playlists. Try again.");
        } finally {
            setSaving(false);
        }
    }

    function addPlaylist(id, name) {
        if (playlists.some((playlist) => playlist.id === id)) {
            setError("This playlist is already saved to your account.");
            return;
        }
        void savePlaylist(id, name);
    }

    function removeSelected() {
        if (selected.browserOnly) {
            if (!writeFocusValue("localStorage", storageKey, null)) {
                setError("Could not remove the playlist from this browser.");
                return;
            }
            setBrowserId(null);
            selectPlaylist(playlists[0]?.id ?? null);
            setError("");
            return;
        }
        void savePlaylist(selected.id, null);
    }

    const player = selected && (
        <iframe
            key={`${selected.id}:${locked}`}
            id="focus-spotify-player"
            title={`Spotify playlist: ${selected.name}`}
            src={`https://open.spotify.com/embed/playlist/${selected.id}`}
            height={playerHeight}
            className={playerIsFloating ? undefined : "mt-3 block w-full rounded-xl border-0"}
            allow="autoplay; clipboard-write; encrypted-media"
            sandbox={locked ? "allow-scripts allow-same-origin" : undefined}
        />
    );

    return (
        <section className={className}>
            <div className="flex min-h-9 flex-wrap items-center gap-2">
                <h2 className="mr-auto flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <Music2 size={16} aria-hidden="true" /> Focus playlists
                </h2>
                <div className="flex min-w-0 flex-[1_1_9rem] items-center justify-end gap-2">
                    {selected && (
                        <FocusSelect className="w-full max-w-48" aria-label="Choose focus playlist"
                            value={selected.id} onChange={(event) => selectPlaylist(event.target.value)}
                            disabled={saving || choices.length < 2}>
                            {choices.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
                        </FocusSelect>
                    )}
                    {selected && !locked && !playerIsFloating && (
                        <button type="button" aria-label={expanded ? "Collapse player" : "Expand player"}
                            title={expanded ? "Collapse player" : "Expand player"}
                            aria-expanded={expanded} aria-controls="focus-spotify-player"
                            onClick={() => setExpanded((current) => !current)} style={focusControlStyle}
                            className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/75 bg-white/55 text-slate-700 hover:bg-white/80 focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200">
                            {expanded ? <Minimize2 size={15} aria-hidden="true" /> : <Maximize2 size={15} aria-hidden="true" />}
                        </button>
                    )}
                </div>
            </div>

            {!playerIsFloating && player}
            {playerIsFloating && selected && (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Spotify is in the floating window.</p>
            )}
            {floating && selected && createPortal(
                <div className="focus-spotify">
                    <div className="focus-track-header">
                        <Music2 size={14} aria-hidden="true" />
                        <p className="focus-track-title" title={selected.name}>
                            {playerIsFloating ? "Spotify" : selected.name}
                        </p>
                        <button type="button" className="focus-player-action"
                            title="Moving the player restarts playback."
                            aria-label={playerIsFloating
                                ? "Return Spotify player to Takda. Playback restarts."
                                : "Float Spotify player. Playback restarts."}
                            onClick={() => {
                                setPlayerWindowId(playerIsFloating ? null : floating.id);
                                floating.resizePlayer(!playerIsFloating);
                            }}>
                            {playerIsFloating ? "Return player" : "Float player"}
                        </button>
                    </div>
                    {playerIsFloating && player}
                </div>,
                floating.spotifyHost
            )}

            {loadState === "loading" && !selected && <p role="status" className="mt-3 text-xs">Loading playlists…</p>}
            {loadState === "failed" && (
                <p role="status" className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                    Could not load your account playlists.{" "}
                    {!locked && <button type="button" className="font-medium underline" onClick={() => {
                        setLoadState("loading");
                        setLoadAttempt((current) => current + 1);
                    }}>Retry</button>}
                </p>
            )}

            {canManage && !adding && (
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-xs">
                    <button type="button" disabled={saving} style={focusControlStyle} onClick={() => { setError(""); setAdding(true); }}
                        className="inline-flex items-center gap-1 font-medium text-green-800 hover:underline dark:text-green-300">
                        <Plus size={14} aria-hidden="true" /> Add playlist
                    </button>
                    {selected?.browserOnly && (
                        <button type="button" disabled={saving} style={focusControlStyle} onClick={() => void savePlaylist(selected.id, selected.name)}
                            className="font-medium text-green-800 hover:underline dark:text-green-300">
                            Save to account
                        </button>
                    )}
                    {selected && (
                        <button type="button" disabled={saving} style={focusControlStyle} onClick={removeSelected}
                            className="text-slate-600 hover:underline dark:text-slate-400">
                            Remove playlist
                        </button>
                    )}
                </div>
            )}

            {canManage && adding && (
                <FocusPlaylistForm saving={saving} onSave={addPlaylist}
                    onCancel={() => { setAdding(false); setError(""); }} />
            )}

            {saving && <p role="status" className="mt-2 text-xs">Updating playlists…</p>}
            {error && <p role="alert" className="mt-2 text-xs text-red-700 dark:text-red-300">{error}</p>}
            {locked && !selected && loadState === "ready" && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Add a playlist between sessions.</p>
            )}
        </section>
    );
}

export default FocusPlaylist;
