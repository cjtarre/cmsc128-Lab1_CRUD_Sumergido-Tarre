import { useState } from "react";

import { createTaskHandlers } from "../../tasks/handlers/taskHandlers";
import { useMobileTaskFilters } from "../../tasks/hooks/useMobileTaskFilters";
import { useTaskFilters } from "../../tasks/hooks/useTaskFilters";
import useTasks from "../../tasks/hooks/useTasks";
import { useProjectMembersList } from "./useProjectMembersList";

// Keep project-list state and event handlers out of the view component.
export function useProjectListController(projectId, tasks, setTasks) {
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

    const members = useProjectMembersList(projectId);
    const taskActions = useTasks(tasks, setTasks, projectId);
    const handlers = createTaskHandlers({
        ...taskActions, setSelectedTask, setTaskToEdit, setTaskToDelete, setIsAddTaskOpen,
    });
    const filterState = useTaskFilters(tasks);
    const { isOpen, setIsOpen, ref } = useMobileTaskFilters();

    return {
        selectedTask, taskToEdit, taskToDelete, isAddTaskOpen, members, handlers,
        ...filterState,
        isMobileFiltersOpen: isOpen,
        setIsMobileFiltersOpen: setIsOpen,
        mobileFiltersRef: ref,
    };
}
