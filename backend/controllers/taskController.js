const supabase = require("../config/supabaseClient");

const getAllTasks = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("tasks")
            .select(`
                *,
                task_tag (
                    tags (
                        tag_id,
                        tag_name,
                        tag_info
                    )
                )
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.status(200).json(data);
  
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const createTask = async (req, res) => {
    try {
        const { task_name, task_info, priority_level, status, due_date, tag_ids } = req.body;
        
        const { data: newTask, error: newTaskError } = await supabase
            .from('tasks')
            .insert([{ task_name, task_info, priority_level, status, due_date }])
            .select()
            .single();

        if (newTaskError) throw newTaskError;

        if (tag_ids && tag_ids.length > 0) {
            const taskTags = tag_ids.map(tag_id => ({ 
                task_id: newTask.task_id, 
                tag_id: tag_id}));
            
            const { error: taskTagsError } = await supabase
                .from('task_tag')
                .insert(taskTags);
            
            if (taskTagsError) throw taskTagsError;
        }
        res.status(201).json(newTask);

    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const updateTask = async (req, res) => {
    try {
        const { task_id } = req.params;
        const { task_name, task_info, priority_level, status, due_date} = req.body;

        const { data, error } = await supabase
            .from('tasks')
            .update({ task_name, task_info, priority_level, status, due_date })
            .eq('task_id', task_id)
            .select();
        
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const deleteTask = async (req, res) => {
    try {
        const { task_id } = req.params;
        const { data, error } = await supabase
            .from('tasks')
            .delete()
            .eq('task_id', task_id)
            .select();
        
        if (error) throw error;
        res.status(200).json({message: `Task with ID ${task_id} deleted successfully`, data});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask
};