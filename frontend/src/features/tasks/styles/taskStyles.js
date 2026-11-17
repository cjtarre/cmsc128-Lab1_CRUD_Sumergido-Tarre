import { PRIORITY, STATUS } from "../constants/taskOptions";
import { DEFAULT_TAG_COLOR } from "../constants/tagOptions";

export { DEFAULT_TAG_COLOR } from "../constants/tagOptions";

export function getTaskGridColumns(collaborative) {
    return collaborative
        ? "sm:grid-cols-[minmax(180px,2fr)_minmax(100px,0.9fr)_minmax(95px,0.8fr)_minmax(75px,0.65fr)_minmax(135px,1.05fr)_minmax(110px,1fr)_44px]"
        : "sm:grid-cols-[minmax(0,2.3fr)_minmax(110px,0.9fr)_minmax(180px,1.2fr)_44px]";
}

export const taskSelectStyle = { appearance: "none", WebkitAppearance: "none", fontFamily: "inherit", fontSize: "11px", lineHeight: "1.2" };

const taskStyles = {
    priority: {
        [PRIORITY.NONE]: "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
        [PRIORITY.LOW]: "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400",
        [PRIORITY.MEDIUM]: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400",
        [PRIORITY.HIGH]: "bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400",
    },

    status: {
        [STATUS.NOT_STARTED]: "text-slate-500 dark:text-slate-400",
        [STATUS.IN_PROGRESS]: "text-amber-600 dark:text-amber-400",
        [STATUS.COMPLETED]: "text-green-600 dark:text-green-400",
    },

    statusDot: {
        [STATUS.NOT_STARTED]: "bg-slate-300 dark:bg-slate-600",
        [STATUS.IN_PROGRESS]: "bg-sky-400",
        [STATUS.COMPLETED]: "bg-green-500",
    },

    // Legacy preset styles remain as a fallback while tag colors move to database values.
    tag: {
        1: "bg-blue-50/50 text-blue-500 dark:bg-blue-950/20 dark:text-blue-400",
        2: "bg-purple-50/50 text-purple-500 dark:bg-purple-950/20 dark:text-purple-400",
        3: "bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400",
    },
};

// Custom tag colors are stored as six-digit hex values in the database.
export const getTagColor = (tag) => tag?.color || DEFAULT_TAG_COLOR;

const colorChannels = (hex) => {
    const safe = /^#[0-9a-f]{6}$/i.test(hex) ? hex : DEFAULT_TAG_COLOR;
    return [1, 3, 5].map((index) => parseInt(safe.slice(index, index + 2), 16));
};

const toHex = (rgb) => `#${rgb.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
const blendWithWhite = (rgb, weight) => rgb.map((value) => Math.round(value * weight + 255 * (1 - weight)));
const luminance = (rgb) => rgb.reduce((sum, channel, index) => {
    const value = channel / 255;
    const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    return sum + linear * [0.2126, 0.7152, 0.0722][index];
}, 0);

// Swatches need their own contrast treatment: white/pale colors must retain a
// visible outline, and their selection checkmark must never blend into the fill.
export const getTagSwatchStyle = (hex) => {
    const rgb = colorChannels(hex);
    const brightness = luminance(rgb);
    return {
        backgroundColor: toHex(rgb),
        color: brightness > 0.179 ? "#000000" : "#ffffff",
        borderColor: brightness > 0.72 ? "#94a3b8" : "#64748b",
    };
};

// Use the saved color for the dot, but darken label text as needed for contrast.
export const getTagInlineStyle = (tag, selected = false) => {
    const rgb = colorChannels(getTagColor(tag));
    // Very dark custom colors should look dark, not wash out into a gray pill.
    // Keep the original saved HEX value for the dot and for persistence.
    if (luminance(rgb) < 0.025) {
        return {
            borderColor: selected ? "#64748b" : "#475569",
            backgroundColor: selected ? "#111318" : "#1c2028",
            color: "#ffffff",
        };
    }
    const background = blendWithWhite(rgb, selected ? 0.22 : 0.10);
    const minimumContrast = 4.5;
    const maxTextLuminance = (luminance(background) + 0.05) / minimumContrast - 0.05;
    let readable = [...rgb];

    while (luminance(readable) > maxTextLuminance) {
        readable = readable.map((channel) => Math.max(0, channel - 1));
    }

    return {
        borderColor: selected ? toHex(blendWithWhite(rgb, 0.48)) : "transparent",
        backgroundColor: toHex(background),
        color: toHex(readable),
    };
};

export default taskStyles;