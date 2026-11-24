// Return the user's best available name with a safe fallback.
export function getDisplayName(user, fallback = "User") {
    return user?.display_name?.trim() || user?.username?.trim() || fallback;
}

// Generate up to two initials from a name.
export function getInitials(name) {
    const parts = name?.trim().split(/\s+/).filter(Boolean) || [];

    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}