import {
    AlertTriangle, BookOpen, Briefcase, CalendarDays, ClipboardList, Clock3,
    Code2, Crown, Database, Eye, Flag, Folder, GraduationCap, Heart, Home,
    LayoutDashboard, Lightbulb, ListChecks, ListTodo, Palette, PanelsTopLeft,
    Pencil, Plane, Rocket, Settings, Star, Target, Terminal, Users,
} from "lucide-react";

export const PROJECT_ROLE = {
    OWNER: "owner",
    EDITOR: "editor",
    VIEWER: "viewer",
};

// Roles that an owner can assign to existing members.
export const EDITABLE_PROJECT_ROLES = [PROJECT_ROLE.EDITOR, PROJECT_ROLE.VIEWER];

// Project role options and access descriptions.
export const PROJECT_ACCESS_ROLES = [
    { role: PROJECT_ROLE.OWNER, label: "Owner", description: "Full project control", icon: Crown },
    { role: PROJECT_ROLE.EDITOR, label: "Editor", description: "Manage project work", icon: Pencil },
    { role: PROJECT_ROLE.VIEWER, label: "Viewer", description: "Read-only access", icon: Eye },
];

// Project overview statistic cards.
export const PROJECT_STATS = [
    { key: "total", label: "Total Tasks", icon: ClipboardList },
    { key: "active", label: "Active", icon: Clock3 },
    { key: "completed", label: "Completed", icon: ListChecks },
    { key: "overdue", label: "Overdue", icon: AlertTriangle },
];

// Roles available when inviting a project member.
export const PROJECT_INVITE_ROLES = [
    { value: PROJECT_ROLE.VIEWER, label: "Viewer — view project work" },
    { value: PROJECT_ROLE.EDITOR, label: "Editor — manage project work" },
];

// Available project workspace views.
export const PROJECT_TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "list", label: "List", icon: ListTodo },
    { id: "board", label: "Board", icon: PanelsTopLeft },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "settings", label: "Settings", icon: Settings },
];

// Valid workspace view IDs used for URL validation.
export const PROJECT_TAB_IDS = new Set(PROJECT_TABS.map((tab) => tab.id));

// Project icon accent styles.
export const PROJECT_ACCENTS = {
    green: "bg-green-50 text-green-500 group-hover:bg-green-100/80 dark:bg-green-950/40 dark:text-green-400 dark:group-hover:bg-green-900/60",
    blue: "bg-blue-50 text-blue-500 group-hover:bg-blue-100/80 dark:bg-blue-950/40 dark:text-blue-400 dark:group-hover:bg-blue-900/60",
    purple: "bg-purple-50 text-purple-500 group-hover:bg-purple-100/80 dark:bg-purple-950/40 dark:text-purple-400 dark:group-hover:bg-purple-900/60",
    orange: "bg-orange-50 text-orange-500 group-hover:bg-orange-100/80 dark:bg-orange-950/40 dark:text-orange-400 dark:group-hover:bg-orange-900/60",
    pink: "bg-pink-50 text-pink-500 group-hover:bg-pink-100/80 dark:bg-pink-950/40 dark:text-pink-400 dark:group-hover:bg-pink-900/60",
    red: "bg-red-50 text-red-500 group-hover:bg-red-100/80 dark:bg-red-950/40 dark:text-red-400 dark:group-hover:bg-red-900/60",
    amber: "bg-amber-50 text-amber-500 group-hover:bg-amber-100/80 dark:bg-amber-950/40 dark:text-amber-400 dark:group-hover:bg-amber-900/60",
    cyan: "bg-cyan-50 text-cyan-500 group-hover:bg-cyan-100/80 dark:bg-cyan-950/40 dark:text-cyan-400 dark:group-hover:bg-cyan-900/60",
    slate: "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700",
};
// Choices offered by the project appearance editor.
export const PROJECT_ICON_OPTIONS = [
    { id: "folder", icon: Folder, label: "Folder" },
    { id: "briefcase", icon: Briefcase, label: "Briefcase" },
    { id: "book-open", icon: BookOpen, label: "Book" },
    { id: "graduation-cap", icon: GraduationCap, label: "School" },
    { id: "code", icon: Code2, label: "Code" },
    { id: "terminal", icon: Terminal, label: "Terminal" },
    { id: "database", icon: Database, label: "Database" },
    { id: "calendar", icon: CalendarDays, label: "Calendar" },
    { id: "target", icon: Target, label: "Target" },
    { id: "flag", icon: Flag, label: "Flag" },
    { id: "lightbulb", icon: Lightbulb, label: "Idea" },
    { id: "palette", icon: Palette, label: "Creative" },
    { id: "plane", icon: Plane, label: "Plane" },
    { id: "rocket", icon: Rocket, label: "Rocket" },
    { id: "star", icon: Star, label: "Star" },
    { id: "heart", icon: Heart, label: "Heart" },
    { id: "home", icon: Home, label: "Home" },
];

export const PROJECT_ICONS = Object.fromEntries(PROJECT_ICON_OPTIONS.map(({ id, icon }) => [id, icon]));

export const PROJECT_ACCENT_OPTIONS = [
    { id: "green", label: "Green", className: "bg-green-500" },
    { id: "blue", label: "Blue", className: "bg-blue-500" },
    { id: "purple", label: "Purple", className: "bg-purple-500" },
    { id: "orange", label: "Orange", className: "bg-orange-500" },
    { id: "pink", label: "Pink", className: "bg-pink-500" },
    { id: "red", label: "Red", className: "bg-red-500" },
    { id: "amber", label: "Amber", className: "bg-amber-400" },
    { id: "cyan", label: "Cyan", className: "bg-cyan-500" },
    { id: "slate", label: "Slate", className: "bg-slate-500" },
];

// Project grid paging and motion configuration.
export const PROJECT_BATCH_SIZE = 12;
export const PROJECT_STACK_DEPTH = 4;
export const PROJECT_STACK_DELAY = 500;
export const PROJECT_DESKTOP_BREAKPOINT = "(min-width: 640px)";
