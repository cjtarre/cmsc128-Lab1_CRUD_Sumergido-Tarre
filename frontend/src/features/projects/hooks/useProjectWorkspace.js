import { useCallback, useEffect, useState } from "react";

import { convertApiTask } from "../../tasks/hooks/useTasks";
import { taskService } from "../../tasks/services/taskService";
import { projectService } from "../services/projectService";

// Manage project workspace data and loading states.
export function useProjectWorkspace(projectId) {
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshingActivity, setRefreshingActivity] = useState(false);
    const [error, setError] = useState("");
    const [projectUnavailable, setProjectUnavailable] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

    // Refresh only the activity feed.
    const loadActivities = useCallback(async () => {
        try {
            setRefreshingActivity(true);
            const data = await projectService.getActivities(projectId);
            setActivities(Array.isArray(data) ? data : []);
        } catch (err) {
            if (err.response?.status !== 404 && err.response?.status !== 403) console.error("Error refreshing project activity:", err);
        } finally {
            setRefreshingActivity(false);
        }
    }, [projectId]);

    // Load the project, tasks, and activity together.
    useEffect(() => {
        const loadWorkspace = async () => {
            try {
                setLoading(true);
                setError("");
                setProjectUnavailable(false);
                setAccessDenied(false);

                const [projectsData, tasksData, activitiesData] = await Promise.all([
                    projectService.getProjects(),
                    taskService.getTasks(projectId),
                    projectService.getActivities(projectId),
                ]);

                const projects = Array.isArray(projectsData) ? projectsData : [];
                const matchedProject = projects.find((item) => String(item.id) === String(projectId) && !item.is_default);

                if (!matchedProject) {
                    setProjectUnavailable(true);
                    return;
                }

                setProject(matchedProject);
                setTasks((Array.isArray(tasksData) ? tasksData : []).map(convertApiTask));
                setActivities(Array.isArray(activitiesData) ? activitiesData : []);
            } catch (err) {
                if (err.response?.status === 404) {
                    setProjectUnavailable(true);
                    return;
                }

                if (err.response?.status === 403) {
                    setAccessDenied(true);
                    return;
                }

                console.error("Error loading project workspace:", err);
                setError(err.response?.data?.error || "Unable to load this project.");
            } finally {
                setLoading(false);
            }
        };

        loadWorkspace();
    }, [projectId]);

    return {
        project, tasks, setTasks, activities,
        loading, refreshingActivity, error,
        projectUnavailable, accessDenied, loadActivities,
    };
}