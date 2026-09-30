const { supabase, supabaseUrl, supabaseKey } = require('../config/supabaseClient');
const supabaseAdmin = require('../config/supabaseAdmin');
const { createClient } = require('@supabase/supabase-js');
const { validatePassword, validateUsername } = require('../utils/validation');

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const [scheme, token, extra] = authHeader?.split(' ') ?? [];

        if (scheme !== 'Bearer' || !token || extra) {
            return res.status(401).json({ error: 'Access token missing or invalid' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Access token missing or invalid' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error authenticating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Creates the Auth account and its matching application profile.
const signUpUser = async (req, res) => {
    try {
        const { email, password, username, display_name } = req.body;

        const trimmedEmail = email?.trim();
        const normalizedUsername = username?.trim().toLowerCase();
        const trimmedDisplayName = display_name?.trim();

        if (!trimmedEmail || !password || !normalizedUsername || !trimmedDisplayName) {
            return res.status(400).json({
                error: 'Email, password, username, and display name are required',
            });
        }

        // Apply the shared account validation rules.
        const passwordError = validatePassword(password);
        if (passwordError) return res.status(400).json({ error: passwordError });

        const usernameError = validateUsername(normalizedUsername);
        if (usernameError) return res.status(400).json({ error: usernameError });

        // Reject an already registered username before creating the Auth user.
        const { data: existingProfile, error: lookupError } = await supabaseAdmin
            .from('profiles')
            .select('user_id')
            .eq('username', normalizedUsername)
            .maybeSingle();

        if (lookupError) throw lookupError;
        if (existingProfile) {
            return res.status(409).json({ error: 'That username is already taken' });
        }

        // Supabase Auth owns email, password, and authentication data.
        const { data, error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password,
        });

        if (error) return res.status(400).json({ error: error.message });

        if (data.user?.identities?.length === 0) {
            return res.status(409).json({
                error: 'An account with this email already exists',
            });
        }

        // Profiles owns application-specific username and display name data.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                user_id: data.user.id,
                username: normalizedUsername,
                display_name: trimmedDisplayName,
            });

        // Remove incomplete Auth accounts if profile creation fails.
        if (profileError) {
            await supabaseAdmin.auth.admin.deleteUser(data.user.id);
            throw profileError;
        }

        return res.status(201).json({
            message: 'User signed up successfully',
            user: {
                id: data.user.id,
                email: data.user.email,
                username: normalizedUsername,
                display_name: trimmedDisplayName,
            },
        });
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Accepts either a registered username or email.
const logInUser = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const trimmedIdentifier = identifier?.trim();

        if (!trimmedIdentifier || !password) {
            return res.status(400).json({ error: 'Username or email and password are required' });
        }

        let email = trimmedIdentifier;

        // Resolve usernames to the matching Auth email.
        if (!trimmedIdentifier.includes('@')) {
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('user_id')
                .eq('username', trimmedIdentifier.toLowerCase())
                .maybeSingle();

            if (profileError) throw profileError;

            if (!profile) {
                return res.status(400).json({ error: 'Invalid username/email or password' });
            }

            const { data: authData, error: authError } =
                await supabaseAdmin.auth.admin.getUserById(profile.user_id);

            if (authError || !authData.user?.email) {
                return res.status(400).json({ error: 'Invalid username/email or password' });
            }

            email = authData.user.email;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({ error: 'Invalid username/email or password' });
        }

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('username, display_name')
            .eq('user_id', data.user.id)
            .single();

        if (profileError) throw profileError;

        return res.status(200).json({
            message: 'User signed in successfully',
            user: {
                id: data.user.id,
                email: data.user.email,
                username: profile.username,
                display_name: profile.display_name,
            },
            session: data.session,
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const logOutUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(200).json({ message: 'User logged out successfully' });
        }

        // Fresh, request-scoped client — never shared across requests
        const requestClient = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
        });

        const { error: setSessionError } = await requestClient.auth.setSession({
            access_token: token,
            refresh_token: req.body.refresh_token,
        });

        if (setSessionError) throw setSessionError;

        const { error: signOutError } = await requestClient.auth.signOut();
        if (signOutError) throw signOutError;

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Returns the authenticated user with application profile data.
const getCurrentUser = async (req, res) => {
    try {
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('username, display_name')
            .eq('user_id', req.user.id)
            .single();

        if (error) throw error;

        res.status(200).json({
            user: {
                id: req.user.id,
                email: req.user.email,
                username: profile.username,
                display_name: profile.display_name,
            },
        });
    } catch (error) {
        console.error('Error getting current user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        const { data, error } = await supabase.auth.refreshSession({ refresh_token });
        if (error) return res.status(400).json({ error: error.message });

        return res.status(200).json({
            message: 'Session refreshed successfully',
            session: data.session,
        });
    } catch (error) {
        console.error('Error refreshing session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Public — sends a recovery email. Uses a generic success message so callers
// can't use this endpoint to discover which email addresses are registered.
const forgotPassword = async (req, res) => {
    const email = req.body.email?.trim();

    if (!email) {
        return res.status(400).json({ error: 'Email address is required' });
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        });

        // Give clear feedback when Supabase temporarily limits recovery emails.
        if (error?.code === 'over_email_send_rate_limit') {
            return res.status(429).json({
                error: 'Too many reset requests. Please wait a few minutes before trying again.',
            });
        }

        // Keep unexpected recovery failures generic.
        if (error) {
            console.error('Error requesting password reset:', error);

            return res.status(500).json({
                error: 'Unable to send a reset link right now. Please try again later.',
            });
        }

        return res.status(200).json({
            message: 'If that email is registered, a reset link has been sent.',
        });
    } catch (error) {
        console.error('Error requesting password reset:', error);

        return res.status(500).json({
            error: 'Unable to send a reset link right now. Please try again later.',
        });
    }
};

// Public — completes the recovery flow using the access_token + refresh_token
// the frontend pulled out of the emailed reset link. Not behind requireAuth:
// the user isn't logged in yet, possession of those tokens IS the proof.
const resetPassword = async (req, res) => {
    try {
        const { access_token, refresh_token, password } = req.body;

        if (!access_token || !refresh_token || !password) {
            return res.status(400).json({
                error: 'access_token, refresh_token, and password are required',
            });
        }

        // Enforce the same password policy used during registration.
        const passwordError = validatePassword(password);
        
        if (passwordError) {
            return res.status(400).json({ error: passwordError });
        }

        // Fresh, request-scoped client for the recovery session.
        const requestClient = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
        });

        const { error: setSessionError } = await requestClient.auth.setSession({
            access_token,
            refresh_token,
        });

        if (setSessionError) throw setSessionError;

        const { error: updateError } = await requestClient.auth.updateUser({
            password,
        });

        if (updateError) throw updateError;

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(400).json({ error: 'Invalid or expired reset link' });
    }
};

module.exports = {
    requireAuth,
    signUpUser,
    logInUser,
    logOutUser,
    getCurrentUser,
    refreshToken,
    forgotPassword,
    resetPassword,
};