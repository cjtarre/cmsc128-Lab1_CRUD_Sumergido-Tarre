import { AnimatePresence } from "motion/react";

import ProjectBoard from "./ProjectBoard";
import ProjectCalendar from "./ProjectCalendar";
import ProjectList from "../cards/ProjectList";
import ProjectMembers from "../members/ProjectMembers";
import ProjectOverview from "./ProjectOverview";
import PageTransition from "../../../../shared/components/effects/PageTransition";

// Render the active project workspace view.
function ProjectWorkspaceContent({
    activeTab, project, projectId, tasks, setTasks, activities,
    canEdit, setActiveTab, loadActivities, refreshingActivity,
}) {
    let content;

    switch (activeTab) {
        case "overview":
            content = <ProjectOverview tasks={tasks} activities={activities} loading={false}
                onOpenList={() => setActiveTab("list")} onRefreshActivity={loadActivities}
                refreshingActivity={refreshingActivity} />;
            break;

        case "list":
            content = <ProjectList projectId={projectId} tasks={tasks} setTasks={setTasks} canEdit={canEdit} />;
            break;

        case "board":
            content = <ProjectBoard projectId={projectId} tasks={tasks} setTasks={setTasks} canEdit={canEdit} />;
            break;

        case "calendar":
            content = <ProjectCalendar projectId={projectId} tasks={tasks} setTasks={setTasks} canEdit={canEdit} />;
            break;

        case "members":
            content = <ProjectMembers project={project} />;
            break;

        default:
            content = null;
    }

    return (
        <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={activeTab}>{content}</PageTransition>
        </AnimatePresence>
    );
}

export default ProjectWorkspaceContent;
