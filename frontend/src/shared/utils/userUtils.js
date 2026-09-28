export function getDisplayName(user) {
    return user?.user_metadata?.username?.trim() || "User";
}

export function getInitials(name) {
    const parts = name?.trim().split(/\s+/).filter(Boolean) || [];

    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}