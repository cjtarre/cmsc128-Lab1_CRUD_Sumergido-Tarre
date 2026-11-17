import { useState } from "react";

import { readFocusValue, writeFocusValue } from "../utils/focusSessionStorage";

export function useFocusSpotifyControls({ userId, initialPlaylistId, floating }) {
    const spotifyPreferenceKey = `takda-focus-spotify-visible:${userId}`;
    const [showSpotify, setShowSpotify] = useState(() =>
        Boolean(initialPlaylistId) || readFocusValue("localStorage", spotifyPreferenceKey, false) === true
    );
    const [playerWindowId, setPlayerWindowId] = useState(null);
    const playerIsFloating = Boolean(floating && floating.id === playerWindowId);

    function toggleSpotify() {
        const visible = !showSpotify;
        if (!visible && playerIsFloating) {
            setPlayerWindowId(null);
            floating.resizePlayer(false);
        }
        setShowSpotify(visible);
        writeFocusValue("localStorage", spotifyPreferenceKey, visible);
    }

    function toggleFloatingPlayer() {
        setPlayerWindowId(playerIsFloating ? null : floating.id);
        floating.resizePlayer(!playerIsFloating);
    }

    return { showSpotify, playerIsFloating, toggleSpotify, toggleFloatingPlayer };
}
