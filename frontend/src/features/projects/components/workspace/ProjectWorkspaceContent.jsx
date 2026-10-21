import ProjectBoard from "./ProjectBoard";
import ProjectCalendar from "./ProjectCalendar";
import ProjectList from "../cards/ProjectList";
import ProjectMembers from "../members/ProjectMembers";
import ProjectOverview from "./ProjectOverview";

// Render the active project workspace view.
function ProjectWorkspaceContent({
    activeTab, project, projectId, tasks, setTasks, activities,
    canEdit, setActiveTab, loadActivities, refreshingActivity,
}) {
    switch (activeTab) {
        case "overview":
            return <ProjectOverview tasks={tasks} activities={activities} loading={false}
                onOpenList={() => setActiveTab("list")} onRefreshActivity={loadActivities}
                refreshingActivity={refreshingActivity} />;

        case "list":
            return <ProjectList projectId={projectId} tasks={tasks} setTasks={setTasks} canEdit={canEdit} />;

        case "board":
            return <ProjectBoard projectId={projectId} tasks={tasks} setTasks={setTasks} canEdit={canEdit} />;

        case "calendar":
            return <ProjectCalendar projectId={projectId} tasks={tasks} setTasks={setTasks} canEdit={canEdit} />;

        case "members":
            return <ProjectMembers project={project} />;

        default:
            return null;
    }
}

export default ProjectWorkspaceContent;

