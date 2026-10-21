import { useMemo, useState } from "react";

import { getDisplayName, getInitials } from "../../../shared/utils/userUtils";

// Manage calendar assignee filtering and task member metadata.
export function useCalendarMemberFilter(tasks, members) {
    const [selectedMemberId, setSelectedMemberId] = useState("all");
    const memberMap = useMemo(() => new Map(members.map((member) => [String(member.user_id), member])), [members]);

    const calendarTasks = useMemo(() => {
        if (selectedMemberId === "all") return tasks;
        if (selectedMemberId === "unassigned") return tasks.filter((task) => !task.assigneeId);
        return tasks.filter((task) => String(task.assigneeId) === selectedMemberId);
    }, [tasks, selectedMemberId]);

    const filterOptions = useMemo(() => [
        { id: "all", name: "All assignees", initials: null },
        { id: "unassigned", name: "Unassigned", initials: "—" },
        ...members.map((member) => {
            const name = getDisplayName(member, "Member");
            return { id: String(member.user_id), name, initials: getInitials(name) };
        }),
    ], [members]);

    const getTaskMeta = (task) => {
        if (!task.assigneeId) return { initials: "—", name: "Unassigned" };

        const member = task.assignee || memberMap.get(String(task.assigneeId));
        if (!member) return { initials: "—", name: "Unassigned" };

        const name = getDisplayName(member, "Member");
        return { initials: getInitials(name), name };
    };

    return { selectedMemberId, setSelectedMemberId, calendarTasks, filterOptions, getTaskMeta };
}