const supabase = require('../config/supabaseClient');

const getAllTags = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .order('tag_name', { ascending: true });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getAllTags };
