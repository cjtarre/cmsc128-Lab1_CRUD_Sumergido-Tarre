const SPOTIFY_PLAYLIST_ID = /^[a-zA-Z0-9]{22}$/;

export function isSpotifyPlaylistId(value) {
    return typeof value === "string" && value.length === 22 && SPOTIFY_PLAYLIST_ID.test(value);
}

export function getSpotifyPlaylistId(value) {
    try {
        const url = new URL(value.trim());
        if (url.origin !== "https://open.spotify.com" || url.username || url.password) return null;

        const id = url.pathname.match(/^\/(?:intl-[a-z-]+\/)?(?:embed\/)?playlist\/([^/]+)\/?$/)?.[1];
        return isSpotifyPlaylistId(id) ? id : null;
    } catch {
        return null;
    }
}
