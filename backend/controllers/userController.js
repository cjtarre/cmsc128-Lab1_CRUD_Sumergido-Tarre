const { supabaseUrl, supabaseKey } = require('../config/supabaseClient');
const supabaseAdmin = require('../config/supabaseAdmin');
const { createClient } = require('@supabase/supabase-js');
const { validatePassword } = require('../utils/validation');

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

// Update display_name and/or username. Merged into existing user_metadata
// (not replaced) so updating one field never wipes the other.
const updateProfile = async (req, res) => {
    try {
        const { display_name, username } = req.body;

        if (display_name === undefined && username === undefined) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        const user_metadata = { ...req.user.user_metadata };

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

            user_metadata.display_name = trimmedDisplayName;
        }

        if (username !== undefined) {
            const trimmedUsername = username.trim();

            if (!trimmedUsername) {
                return res.status(400).json({ error: 'Username is required' });
            }

            if (trimmedUsername.length > NAME_MAX_LENGTH) {
                return res.status(400).json({
                    error: `Username must be ${NAME_MAX_LENGTH} characters or fewer`,
                });
            }

            user_metadata.username = trimmedUsername;
        }

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            req.user.id,
            { user_metadata }
        );
        if (error) throw error;

        res.status(200).json({
            message: 'Profile updated successfully',
            user: data.user,
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