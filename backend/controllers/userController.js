const { supabaseUrl, supabaseKey } = require('../config/supabaseClient');
const supabaseAdmin = require('../config/supabaseAdmin');
const { createClient } = require('@supabase/supabase-js');
const { validatePassword, validateUsername } = require('../utils/validation');

const NAME_MAX_LENGTH = 50;
const FOCUS_PLAYLIST_PREFIX = 'takda_focus_playlist:';
const LEGACY_FOCUS_PLAYLIST_KEY = 'takda_focus_playlist_id';
const FOCUS_PLAYLIST_LIMIT = 20;
const PLAYLIST_NAME_LIMIT = 60;
const isSpotifyPlaylistId = (value) => typeof value === 'string' && /^[A-Za-z0-9]{22}$/.test(value) && value.length === 22;
const isPlaylistName = (value) => typeof value === 'string' && value.length > 0 && value.length <= PLAYLIST_NAME_LIMIT;

const readFocusPlaylists = (userMetadata) => {
    const metadata = userMetadata ?? {};
    const playlists = new Map();
    const legacyId = metadata[LEGACY_FOCUS_PLAYLIST_KEY];
    if (isSpotifyPlaylistId(legacyId)) playlists.set(legacyId, { id: legacyId, name: 'Saved playlist' });

    for (const [key, name] of Object.entries(metadata)) {
        if (!key.startsWith(FOCUS_PLAYLIST_PREFIX)) continue;
        const id = key.slice(FOCUS_PLAYLIST_PREFIX.length);
        if (isSpotifyPlaylistId(id) && typeof name === 'string' && isPlaylistName(name.trim())) {
            playlists.set(id, { id, name: name.trim() });
        }
    }

    return [...playlists.values()].sort((first, second) =>
        first.name.localeCompare(second.name) || first.id.localeCompare(second.id)
    );
};

const getFocusPlaylist = (req, res) => {
    const playlists = readFocusPlaylists(req.user.user_metadata);
    res.set('Cache-Control', 'no-store');
    res.status(200).json({ playlists });
};

const lookupFocusPlaylist = async (req, res) => {
    const { playlistId } = req.params;
    if (!isSpotifyPlaylistId(playlistId)) {
        return res.status(400).json({ error: 'Expected a valid Spotify playlist ID' });
    }

    const embedUrl = new URL('https://open.spotify.com/oembed');
    embedUrl.searchParams.set('url', `https://open.spotify.com/playlist/${playlistId}`);
    try {
        const response = await fetch(embedUrl, { signal: AbortSignal.timeout(4000), redirect: 'error' });
        if (response.ok) {
            const { title } = await response.json();
            const name = typeof title === 'string'
                ? title.trim().slice(0, PLAYLIST_NAME_LIMIT).replace(/[\uD800-\uDBFF]$/, '')
                : '';
            if (name) return res.status(200).json({ name });
        }
    } catch {
        // Playlist titles can still be entered manually when Spotify is unavailable.
    }

    return res.status(404).json({ error: 'Spotify did not provide a playlist title' });
};

const updateFocusPlaylist = async (req, res) => {
    const { playlistId, name } = req.body ?? {};
    const normalizedName = typeof name === 'string' ? name.trim() : name;
    if (!isSpotifyPlaylistId(playlistId) || (normalizedName !== null && !isPlaylistName(normalizedName))) {
        return res.status(400).json({ error: 'Expected a Spotify playlist ID and a name of 1–60 characters, or null to remove it' });
    }

    const metadata = req.user.user_metadata ?? {};
    const playlists = readFocusPlaylists(metadata);
    const exists = playlists.some((playlist) => playlist.id === playlistId);
    if (normalizedName !== null && !exists && playlists.length >= FOCUS_PLAYLIST_LIMIT) {
        return res.status(409).json({ error: 'You can save up to 20 focus playlists' });
    }

    const updates = { [FOCUS_PLAYLIST_PREFIX + playlistId]: normalizedName };
    if (metadata[LEGACY_FOCUS_PLAYLIST_KEY] === playlistId) {
        updates[LEGACY_FOCUS_PLAYLIST_KEY] = null;
    }

    try {
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
            user_metadata: updates,
        });
        if (error) throw error;
        const saved = readFocusPlaylists(data.user.user_metadata);
        res.status(200).json({ playlists: saved });
    } catch (error) {
        console.error('Error saving focus playlist:', error);
        res.status(500).json({ error: 'Could not update the focus playlist' });
    }
};

// Builds an admin client authenticated as the calling user per request only.
const buildUserScopedClient = async (req) => {
    const authHeader = req.headers.authorization;
    const access_token = authHeader?.split(' ')[1];
    const { refresh_token } = req.body;

    if (!access_token || !refresh_token) {
        const err = new Error('Missing access_token or refresh_token');
        err.status = 400;
        throw err;
    }

    const requestClient = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
    });

    const { error } = await requestClient.auth.setSession({ access_token, refresh_token });
    if (error) throw error;

    return requestClient;
};

// Updates application profile data stored in public.profiles.
const updateProfile = async (req, res) => {
    try {
        const { display_name, username } = req.body;

        if (display_name === undefined && username === undefined) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        const updates = {};

        if (display_name !== undefined) {
            const trimmedDisplayName = display_name.trim();

            if (!trimmedDisplayName) {
                return res.status(400).json({ error: 'Display name is required' });
            }

            if (trimmedDisplayName.length > NAME_MAX_LENGTH) {
                return res.status(400).json({
                    error: `Display name must be ${NAME_MAX_LENGTH} characters or fewer`,
                });
            }

            updates.display_name = trimmedDisplayName;
        }

        if (username !== undefined) {
            const normalizedUsername = username.trim().toLowerCase();
            const usernameError = validateUsername(normalizedUsername);

            if (usernameError) {
                return res.status(400).json({ error: usernameError });
            }

            updates.username = normalizedUsername;
        }

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(updates)
            .eq('user_id', req.user.id)
            .select('user_id, username, display_name')
            .single();

        if (error?.code === '23505') {
            return res.status(409).json({ error: 'That username is already taken' });
        }

        if (error) throw error;

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: req.user.id,
                email: req.user.email,
                username: data.username,
                display_name: data.display_name,
            },
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(error.status || 500).json({
            error: error.status ? error.message : 'Internal Server Error',
        });
    }
};

// Triggers Supabase's own email-change confirmation flow (sent to the new
// address) rather than overwriting the email immediately.
const updateEmail = async (req, res) => {
    try {
        const email = req.body.email?.trim();

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                error: 'Please enter a valid email address',
            });
        }

        const requestClient = await buildUserScopedClient(req);
        const { data, error } = await requestClient.auth.updateUser({ email });
        if (error) throw error;

        res.status(200).json({
            message: 'Confirmation email sent — check your new inbox to complete the change.',
            user: data.user,
        });
    } catch (error) {
        console.error('Error updating email:', error);
        res.status(error.status || 500).json({
            error: error.status ? error.message : 'Internal Server Error',
        });
    }
};

// Change password for an already-authenticated user.
const updatePassword = async (req, res) => {
    try {
        const { password } = req.body;

        const passwordError = validatePassword(password);

        if (passwordError) {
            return res.status(400).json({ error: passwordError });
        }

        const requestClient = await buildUserScopedClient(req);
        const { error } = await requestClient.auth.updateUser({ password });
        if (error) throw error;

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(error.status || 500).json({
            error: error.status ? error.message : 'Internal Server Error',
        });
    }
};

module.exports = { getFocusPlaylist, lookupFocusPlaylist, updateFocusPlaylist, updateProfile, updateEmail, updatePassword };
