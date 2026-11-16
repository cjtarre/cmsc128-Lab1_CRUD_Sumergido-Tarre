import api from "../../../shared/services/api";

const URL = "/api/users/me/focus-playlist";

export async function getFocusPlaylists(signal) {
    const response = await api.get(URL, { signal });
    return response.data.playlists;
}

export async function lookupFocusPlaylistName(id, signal) {
    const response = await api.get(`${URL}/${encodeURIComponent(id)}/title`, { signal });
    return response.data.name;
}

export async function updateFocusPlaylist(playlistId, name) {
    const response = await api.put(URL, { playlistId, name });
    return response.data.playlists;
}
