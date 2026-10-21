import { useEffect, useState } from "react";

import { projectService } from "../services/projectService";

// Load project members for task assignment and filtering.
export function useProjectMembersList(projectId) {
    const [members, setMembers] = useState([]);

    useEffect(() => {
        let active = true;

        const loadMembers = async () => {
            try {
                const data = await projectService.getMembers(projectId);
                if (active) setMembers(data || []);
            } catch (error) {
                console.error("Error fetching project members:", error);
                if (active) setMembers([]);
            }
        };

        loadMembers();
        return () => { active = false; };
    }, [projectId]);

    return members;
}