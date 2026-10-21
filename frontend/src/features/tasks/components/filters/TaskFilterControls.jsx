import { PRIORITY, STATUS } from "../../constants/taskOptions";
import TaskFilterSelect from "./TaskFilterSelect";

function TaskFilterControls({ members, tags, filters, onChange }) {
    return (
        <>
            <TaskFilterSelect value={filters.assignee} onChange={onChange.assignee} className="w-full lg:w-[120px]">
                <option value="">Assignee</option>
                <option value="unassigned">Unassigned</option>
                {members.map((member) => <option key={member.user_id} value={member.user_id}>{member.display_name || member.username || "Member"}</option>)}
            </TaskFilterSelect>

            <TaskFilterSelect value={filters.status} onChange={onChange.status} className="w-full lg:w-[110px]">
                <option value="">Status</option>
                <option value={STATUS.NOT_STARTED}>To Do</option>
                <option value={STATUS.IN_PROGRESS}>In Progress</option>
                <option value={STATUS.COMPLETED}>Done</option>
            </TaskFilterSelect>

            <TaskFilterSelect value={filters.priority} onChange={onChange.priority} className="w-full lg:w-[105px]">
                <option value="">Priority</option>
                <option value={PRIORITY.HIGH}>High</option>
                <option value={PRIORITY.MEDIUM}>Medium</option>
                <option value={PRIORITY.LOW}>Low</option>
                <option value={PRIORITY.NONE}>None</option>
            </TaskFilterSelect>

            <TaskFilterSelect value={filters.tag} onChange={onChange.tag} className="w-full lg:w-[100px]">
                <option value="">Tag</option>
                {tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
            </TaskFilterSelect>
        </>
    );
}

export default TaskFilterControls;
