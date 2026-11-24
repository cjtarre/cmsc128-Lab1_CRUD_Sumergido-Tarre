// Shared limits and color presets for task tags.
export const DEFAULT_TAG_COLOR = "#64748b";

export const TAG_COLOR_NAMES = {
    "#22c55e": "Green",
    "#3b82f6": "Blue",
    "#8b5cf6": "Purple",
    "#ec4899": "Pink",
    "#ef4444": "Red",
    "#f97316": "Orange",
    "#eab308": "Yellow",
    "#14b8a6": "Teal",
    [DEFAULT_TAG_COLOR]: "Slate",
};

export const TAG_COLORS = Object.keys(TAG_COLOR_NAMES);

export const TAG_NAME_MAX_LENGTH = 50;
export const MAX_SELECTED_TAGS = 3;
