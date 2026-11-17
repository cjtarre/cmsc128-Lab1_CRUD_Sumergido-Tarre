import { useEffect, useState } from "react";

import { getFocusPlaylists, updateFocusPlaylist } from "../services/focusPlaylistService";
import { readFocusValue, writeFocusValue } from "../utils/focusSessionStorage";
import { isSpotifyPlaylistId } from "../utils/spotifyPlaylist";

function initialBrowserPlaylist(key) {
    const id = readFocusValue("localStorage", key, null);
    return isSpotifyPlaylistId(id) ? id : null;
}

export function useFocusPlaylists({ storageKey, initialPlaylistId, locked, visible }) {
    const activeKey = `${storageKey}:active`;
    const [browserId, setBrowserId] = useState(() => initialBrowserPlaylist(storageKey));
    const [playlists, setPlaylists] = useState([]);
    const [selectedId, setSelectedId] = useState(() => initialPlaylistId ?? readFocusValue("localStorage", activeKey, null));
    const [loadState, setLoadState] = useState("loading");
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [adding, setAdding] = useState(false);

    const choices = browserId && !playlists.some(({ id }) => id === browserId)
        ? [{ id: browserId, name: "Browser playlist", browserOnly: true }, ...playlists]
        : playlists;
    const selected = choices.find(({ id }) => id === selectedId) ?? choices[0];
    const canManage = visible && !locked && loadState === "ready";

    useEffect(() => {
        if (!visible) return;

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
    }, [loadAttempt, storageKey, visible]);

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

    function retryLoad() {
        setLoadState("loading");
        setLoadAttempt((current) => current + 1);
    }

    function openAddForm() {
        setError("");
        setAdding(true);
    }

    function closeAddForm() {
        setAdding(false);
        setError("");
    }

    return {
        choices, selected, loadState, saving, error, adding, canManage,
        selectPlaylist, savePlaylist, addPlaylist, removeSelected, retryLoad, openAddForm, closeAddForm,
    };
}
