import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import FocusPlaylist from "../../src/features/focus/components/FocusPlaylist";
import { getFocusPlaylists, updateFocusPlaylist } from "../../src/features/focus/services/focusPlaylistService";

vi.mock("../../src/features/focus/services/focusPlaylistService", () => ({
    getFocusPlaylists: vi.fn(),
    updateFocusPlaylist: vi.fn(),
}));

afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.resetAllMocks();
});

it("saves a browser playlist and keeps the same player when expanded", async () => {
    const id = "Abcdefghijklmnopqrstuv";
    const storageKey = "focus-test-playlist";
    localStorage.setItem(storageKey, JSON.stringify(id));
    getFocusPlaylists.mockResolvedValue([]);
    updateFocusPlaylist.mockResolvedValue([{ id, name: "Browser playlist" }]);

    render(<FocusPlaylist storageKey={storageKey} locked={false} />);
    const player = screen.getByTitle("Spotify playlist: Browser playlist");
    expect(player.getAttribute("height")).toBe("152");

    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    expect(screen.getByTitle("Spotify playlist: Browser playlist")).toBe(player);
    expect(player.getAttribute("height")).toBe("352");

    fireEvent.click(await screen.findByRole("button", { name: "Save to account" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Save to account" })).toBeNull());

    expect(updateFocusPlaylist).toHaveBeenCalledWith(id, "Browser playlist");
    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(JSON.parse(localStorage.getItem(`${storageKey}:active`))).toBe(id);
});
