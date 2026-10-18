const supabase = require('../config/supabaseAdmin');
const { parseId } = require('../utils/validation');
const { getRole, getMemberListIds } = require('../utils/listAccess');

// Tags with list_id = null are global presets visible to everyone.
// Tags with a list_id belong to that list and are visible only to its members.
//
// GET /api/tags              -> global presets + tags from every list the user belongs to
// GET /api/tags?list_id=123  -> global presets + tags from that one list (user must be a member)
const getAllTags = async (req, res) => {
    try {
        let listIds;

        if (req.query.list_id !== undefined) {
            const listId = parseId(req.query.list_id);
            if (listId === null) return res.status(400).json({ error: 'Invalid list_id' });
            
            const role = await getRole(listId, req.user.id);
            if (!role) return res.status(404).json({ error: 'List not found' });
            
            listIds = [listId];
        } else {
            listIds = await getMemberListIds(req.user.id);
        }

        let query = supabase
            .from('tags')
            .select('*')
            .order('tag_name', { ascending: true });

        // listIds come from the database / parseId, so they are always integers.
        query = listIds.length > 0
            ? query.or(`list_id.is.null,list_id.in.(${listIds.join(',')})`)
            : query.is('list_id', null);

        const { data, error } = await query;
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getAllTags };