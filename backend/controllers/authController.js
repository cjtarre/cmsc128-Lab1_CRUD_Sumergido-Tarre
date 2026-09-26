const { supabase, supabaseUrl, supabaseKey } = require('../config/supabaseClient');
const { createClient } = require('@supabase/supabase-js');

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access token missing or invalid' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token missing or invalid' });
        }

        const { data: {user}, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Access token missing or invalid' });
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// expects a username field during sign up. remove if you don't want to require it.
const signUpUser = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
            },
        });
        if (error) return res.status(400).json({ error: error.message });

        return res.status(201).json({ 
            message: 'User signed up successfully', 
            user: data.user });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const logInUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return res.status(400).json({ error: error.message });

        return res.status(200).json({ 
            message: 'User signed in successfully', 
            user: data.user,
            session: data.session
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const logOutUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(200).json({ message: 'User logged out successfully' });
        }

        // Fresh, request-scoped client — never shared across requests
        const requestClient = createClient(
            supabaseUrl,
            supabaseKey,
            { auth: { persistSession: false } }
        );

        const {error: setSessionError} = await requestClient.auth.setSession({
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

const getCurrentUser = async (req, res) => { res.status(200).json({ user: req.user }); }

const refreshToken = async (req, res) => {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token ) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }
        const { data, error } = await supabase.auth.refreshSession({ refresh_token });
        if (error) return res.status(400).json({ error: error.message });

        return res.status(200).json({ 
            message: 'Session refreshed successfully', 
            session: data.session
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Public — sends a recovery email. Always responds with the same generic
// message so callers can't use this to discover which emails are registered.
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const genericResponse = () =>
        res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });

    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        });
        if (error) console.error('Error requesting password reset:', error);
    } catch (error) {
        console.error('Error requesting password reset:', error);
    }

    genericResponse();
};

// Public — completes the recovery flow using the access_token + refresh_token
// the frontend pulled out of the emailed reset link. Not behind requireAuth:
// the user isn't logged in yet, possession of those tokens IS the proof.
const resetPassword = async (req, res) => {
    try {
        const { access_token, refresh_token, password } = req.body;
        if (!access_token || !refresh_token || !password) {
            return res.status(400).json({ error: 'access_token, refresh_token, and password are required' });
        }

        const requestClient = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
        });

        const { error: setSessionError } = await requestClient.auth.setSession({ access_token, refresh_token });
        if (setSessionError) throw setSessionError;

        const { error: updateError } = await requestClient.auth.updateUser({ password });
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