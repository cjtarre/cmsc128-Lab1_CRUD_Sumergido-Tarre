const supabase = require('../config/supabaseAdmin');
const { parseId } = require('../utils/validation');
const { getRole, getMemberProjectIds } = require('../utils/projectAccess');

// Tags with project_id = null are global presets visible to everyone.
// Tags with a project_id belong to that project and are visible only to its members.
//
// GET /api/tags              -> global presets + tags from every project the user belongs to
// GET /api/tags?project_id=123  -> global presets + tags from that one project (user must be a member)
const getAllTags = async (req, res) => {
    try {
        let projectIds;

        if (req.query.project_id !== undefined) {
            const projectId = parseId(req.query.project_id);
            if (projectId === null) return res.status(400).json({ error: 'Invalid project_id' });
            
            const role = await getRole(projectId, req.user.id);
            if (!role) return res.status(404).json({ error: 'Project not found' });
            
            projectIds = [projectId];
        } else {
            projectIds = await getMemberProjectIds(req.user.id);
        }

        let query = supabase
            .from('tags')
            .select('*')
            .order('tag_name', { ascending: true });

        // projectIds come from the database / parseId, so they are always integers.
        query = projectIds.length > 0
            ? query.or(`project_id.is.null,project_id.in.(${projectIds.join(',')})`)
            : query.is('project_id', null);

        const { data, error } = await query;
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getAllTags };