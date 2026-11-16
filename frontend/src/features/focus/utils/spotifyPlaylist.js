export function getSpotifyPlaylistId(value) {
    try {
        const url = new URL(value.trim());
        if (url.origin !== "https://open.spotify.com" || url.username || url.password) return null;

        return url.pathname.match(/^\/(?:intl-[a-z-]+\/)?(?:embed\/)?playlist\/([a-zA-Z0-9]{22})\/?$/)?.[1] ?? null;
    } catch {
        return null;
    }
}
