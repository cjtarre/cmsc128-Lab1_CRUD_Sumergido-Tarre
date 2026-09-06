import { STATUS } from "../constants/taskOptions";

const mockTasks = [
    {
        id: 1,
        title: "Finish CMSC 128 Lab",
        description: "Complete the CRUD application.",
        status: STATUS.NOT_STARTED,
        priority: 3,
        dueDate: "06/09/2026",
        dueTime: "11:59 PM",
        tag: 0,
    },
    {
        id: 2,
        title: "Review CMSC 124 notes",
        description: "Review the latest lecture materials.",
        status: STATUS.NOT_STARTED,
        priority: 2,
        dueDate: "06/09/2026",
        dueTime: "2:00 PM",
        tag: 0,
    },
    {
        id: 3,
        title: "Buy groceries",
        description: "Pick up groceries for the week.",
        status: STATUS.NOT_STARTED,
        priority: 1,
        dueDate: "07/09/2026",
        dueTime: "3:00 PM",
        tag: 1,
    },
    {
        id: 4,
        title: "Submit activity",
        description: "Submit the completed activity.",
        status: STATUS.NOT_STARTED,
        priority: 3,
        dueDate: "02/09/2026",
        dueTime: "11:59 PM",
        tag: 0,
    },
];

export default mockTasks;