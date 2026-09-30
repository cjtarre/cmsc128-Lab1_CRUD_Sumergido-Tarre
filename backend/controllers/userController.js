const { supabaseUrl, supabaseKey } = require('../config/supabaseClient');
const supabaseAdmin = require('../config/supabaseAdmin');
const { createClient } = require('@supabase/supabase-js');
const { validatePassword, validateUsername } = require('../utils/validation');

const NAME_MAX_LENGTH = 50;

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

module.exports = { updateProfile, updateEmail, updatePassword };