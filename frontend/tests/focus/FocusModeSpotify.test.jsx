import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { useAuth } from "../../src/features/auth/hooks/useAuth";
import { useTaskData } from "../../src/features/tasks/context/TaskContext";
import FocusMode from "../../src/features/focus/pages/FocusMode";
import { useFocusPictureInPicture } from "../../src/features/focus/hooks/useFocusPictureInPicture";
import { getFocusPlaylists, updateFocusPlaylist } from "../../src/features/focus/services/focusPlaylistService";

vi.mock("../../src/features/auth/hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../src/features/tasks/context/TaskContext", () => ({
    useTaskData: vi.fn(),
}));
vi.mock("../../src/features/focus/hooks/useFocusPictureInPicture", () => ({
    useFocusPictureInPicture: vi.fn(),
}));
vi.mock("../../src/features/focus/services/focusPlaylistService", () => ({
    getFocusPlaylists: vi.fn(),
    updateFocusPlaylist: vi.fn(),
}));

const accountPlaylists = [
    { id: "Abcdefghijklmnopqrstuv", name: "Focus mix" },
    { id: "Bbcdefghijklmnopqrstuv", name: "Study mix" },
];

function openFocus(userId = "user-1", entry = "/focus") {
    useAuth.mockReturnValue({ user: { id: userId } });
    return render(<MemoryRouter initialEntries={[entry]}><FocusMode /></MemoryRouter>);
}

const dialogPrototype = HTMLDialogElement.prototype;
const dialogMethods = {
    show() { this.open = true; },
    showModal() { this.open = true; },
    close() { this.open = false; },
};
const originalDialogMethods = Object.keys(dialogMethods).map((key) =>
    [key, Object.getOwnPropertyDescriptor(dialogPrototype, key)]
);

beforeEach(() => {
    for (const [key, value] of Object.entries(dialogMethods)) {
        Object.defineProperty(dialogPrototype, key, { configurable: true, value });
    }
    useTaskData.mockReturnValue({ tasks: [], loading: false });
    getFocusPlaylists.mockResolvedValue(accountPlaylists);
    useFocusPictureInPicture.mockReturnValue({ supported: false });
});

afterEach(() => {
    cleanup();
    for (const [key, descriptor] of originalDialogMethods) {
        if (descriptor) Object.defineProperty(dialogPrototype, key, descriptor);
        else delete dialogPrototype[key];
    }
    localStorage.clear();
    vi.resetAllMocks();
});

it("starts with the timer only and remembers each account's Spotify setting", async () => {
    const firstVisit = openFocus();
    expect(screen.getByRole("timer", { name: "Time remaining" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Focus playlists" })).toBeNull();
    expect(getFocusPlaylists).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Show Spotify" }));
    await screen.findByTitle("Spotify playlist: Focus mix");
    fireEvent.click(screen.getByRole("combobox", { name: "Choose focus playlist" }));
    fireEvent.click(screen.getByRole("option", { name: "Study mix" }));
    firstVisit.unmount();

    openFocus("user-2").unmount();
    expect(getFocusPlaylists).toHaveBeenCalledTimes(1);
    const secondVisit = openFocus();
    await screen.findByTitle("Spotify playlist: Study mix");
    fireEvent.click(screen.getByRole("button", { name: "Hide Spotify" }));
    expect(screen.queryByTitle("Spotify playlist: Study mix")).toBeNull();
    secondVisit.unmount();

    openFocus();
    expect(screen.getByRole("button", { name: "Show Spotify" }).getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "Show Spotify" }));
    await screen.findByTitle("Spotify playlist: Study mix");
    expect(updateFocusPlaylist).not.toHaveBeenCalled();
});

it("hides only the Spotify player in the floating window", async () => {
    const container = document.createElement("div");
    const timerHost = document.createElement("div");
    const spotifyHost = document.createElement("div");
    container.append(timerHost, spotifyHost);
    document.body.append(container);
    const resizePlayer = vi.fn();
    useFocusPictureInPicture.mockReturnValue({
        supported: true, floating: { id: 1, timerHost, spotifyHost, resizePlayer },
    });

    try {
        openFocus();
        fireEvent.click(screen.getByRole("button", { name: "Show Spotify" }));
        await screen.findByTitle("Spotify playlist: Focus mix");
        fireEvent.click(within(spotifyHost).getByRole("button", { name: "Float Spotify player. Playback restarts." }));
        expect(within(spotifyHost).getByTitle("Spotify playlist: Focus mix")).toBeTruthy();
        expect(resizePlayer).toHaveBeenLastCalledWith(true);

        fireEvent.click(screen.getByRole("button", { name: "Hide Spotify" }));
        expect(spotifyHost.children).toHaveLength(0);
        expect(timerHost.children).not.toHaveLength(0);
        expect(resizePlayer).toHaveBeenLastCalledWith(false);
    } finally {
        cleanup();
        container.remove();
    }
});

it("opens a playlist linked from Profile for that visit", async () => {
    const visit = openFocus("user-1", `/focus?playlist=${accountPlaylists[1].id}`);
    await screen.findByTitle("Spotify playlist: Study mix");
    visit.unmount();

    openFocus();
    expect(screen.getByRole("button", { name: "Show Spotify" })).toBeTruthy();
    expect(getFocusPlaylists).toHaveBeenCalledTimes(1);
});

it("picks an optional task and keeps the playlist menu inside the locked dialog", async () => {
    useTaskData.mockReturnValue({
        tasks: [{ id: 42, title: "Review notes", status: "not_started" }],
        loading: false,
    });

    openFocus();
    const taskSelect = screen.getByRole("combobox", { name: "Task (optional)" });
    expect(taskSelect.getAttribute("aria-describedby")).toBe("focus-task-hint");
    fireEvent.keyDown(taskSelect, { key: "ArrowDown" });
    const taskOptions = screen.getByRole("listbox", { name: "Task (optional)" });
    fireEvent.keyDown(taskOptions, { key: "ArrowDown" });
    const taskOption = within(taskOptions).getByRole("option", { name: "Review notes" });
    expect(document.activeElement).toBe(taskOption);
    fireEvent.click(taskOption);
    expect(taskSelect.textContent).toBe("Review notes");

    fireEvent.click(screen.getByRole("button", { name: "Show Spotify" }));
    await screen.findByTitle("Spotify playlist: Focus mix");
    fireEvent.click(screen.getByRole("button", { name: "Start focus session" }));
    expect(screen.getByText("Review notes", { exact: false })).toBeTruthy();

    const dialog = screen.getByRole("dialog", { name: "Focus Mode" });
    fireEvent.click(within(dialog).getByRole("combobox", { name: "Choose focus playlist" }));
    const playlistOptions = within(dialog).getByRole("listbox", { name: "Choose focus playlist" });
    fireEvent.click(within(playlistOptions).getByRole("option", { name: "Study mix" }));
    expect(within(dialog).getByTitle("Spotify playlist: Study mix")).toBeTruthy();
});
