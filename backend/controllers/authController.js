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

const signUpUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signUp({ email, password });
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

module.exports = { requireAuth, signUpUser, logInUser, logOutUser, getCurrentUser, refreshToken };