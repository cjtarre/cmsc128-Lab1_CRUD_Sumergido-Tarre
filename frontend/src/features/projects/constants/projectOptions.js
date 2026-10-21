import {
    AlertTriangle, BookOpen, Briefcase, CalendarDays, ClipboardList, Clock3,
    Code2, Crown, Database, Eye, Flag, Folder, GraduationCap, Heart, Home,
    LayoutDashboard, Lightbulb, ListChecks, ListTodo, Palette, PanelsTopLeft,
    Pencil, Plane, Rocket, Star, Target, Terminal, Users,
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
    { id: "members", label: "Members", icon: Users },
];

// Valid workspace view IDs used for URL validation.
export const PROJECT_TAB_IDS = new Set(PROJECT_TABS.map((tab) => tab.id));

// Available project icons.
export const PROJECT_ICONS = {
    folder: Folder,
    briefcase: Briefcase,
    "book-open": BookOpen,
    "graduation-cap": GraduationCap,
    code: Code2,
    terminal: Terminal,
    database: Database,
    calendar: CalendarDays,
    target: Target,
    flag: Flag,
    lightbulb: Lightbulb,
    palette: Palette,
    plane: Plane,
    rocket: Rocket,
    star: Star,
    heart: Heart,
    home: Home,
};

// Project icon accent styles.
export const PROJECT_ACCENTS = {
    green: "bg-green-50 text-green-500 group-hover:bg-green-100/80 dark:bg-green-950/40 dark:text-green-400",
    blue: "bg-blue-50 text-blue-500 group-hover:bg-blue-100/80 dark:bg-blue-950/40 dark:text-blue-400",
    purple: "bg-purple-50 text-purple-500 group-hover:bg-purple-100/80 dark:bg-purple-950/40 dark:text-purple-400",
    orange: "bg-orange-50 text-orange-500 group-hover:bg-orange-100/80 dark:bg-orange-950/40 dark:text-orange-400",
    pink: "bg-pink-50 text-pink-500 group-hover:bg-pink-100/80 dark:bg-pink-950/40 dark:text-pink-400",
    red: "bg-red-50 text-red-500 group-hover:bg-red-100/80 dark:bg-red-950/40 dark:text-red-400",
    amber: "bg-amber-50 text-amber-500 group-hover:bg-amber-100/80 dark:bg-amber-950/40 dark:text-amber-400",
    cyan: "bg-cyan-50 text-cyan-500 group-hover:bg-cyan-100/80 dark:bg-cyan-950/40 dark:text-cyan-400",
    slate: "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-400",
};