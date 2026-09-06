const emptyStates = {
    all: {
        title: "No tasks yet",
        description: "Add a task to get started.",
        showAction: true,
    },

    today: {
        title: "No tasks for today",
        description: "You're all caught up for today.",
        showAction: true,
    },

    upcoming: {
        title: "No upcoming tasks",
        description: "You have no upcoming tasks scheduled.",
        showAction: true,
    },

    overdue: {
        title: "No overdue tasks",
        description: "Nice! You're all caught up.",
        showAction: false,
    },

    completed: {
        title: "No completed tasks yet",
        description: "Tasks you complete will appear here.",
        showAction: false,
    },
};

export default emptyStates;