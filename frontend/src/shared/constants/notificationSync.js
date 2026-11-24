// Keep notification and invitation data current without reloading the page.
// React Query pauses interval refetches for background tabs by default.
export const INVITATION_SYNC_INTERVAL_MS = 30_000;
