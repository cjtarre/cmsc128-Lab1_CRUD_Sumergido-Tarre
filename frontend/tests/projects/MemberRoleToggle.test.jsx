import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import MemberRoleToggle from "../../src/features/projects/components/members/MemberRoleToggle";

afterEach(cleanup);

const member = { user_id: "u2", display_name: "Alex", role: "editor" };

describe("MemberRoleToggle", () => {
    it("shows editor and viewer as direct buttons with the active role", () => {
        render(<MemberRoleToggle member={member} onChange={vi.fn()} />);
        expect(screen.getByRole("group", { name: "Role for Alex" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "editor" }).getAttribute("aria-pressed")).toBe("true");
        expect(screen.getByRole("button", { name: "viewer" }).getAttribute("aria-pressed")).toBe("false");
        expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("changes roles directly and does not re-send the selected role", async () => {
        const onChange = vi.fn().mockResolvedValue(undefined);
        render(<MemberRoleToggle member={member} onChange={onChange} />);
        fireEvent.click(screen.getByRole("button", { name: "editor" }));
        expect(onChange).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole("button", { name: "viewer" }));
        await waitFor(() => expect(onChange).toHaveBeenCalledWith("u2", "viewer"));
    });

    it("disables changes during an API request", async () => {
        let finish;
        const onChange = vi.fn(() => new Promise((resolve) => { finish = resolve; }));
        render(<MemberRoleToggle member={member} onChange={onChange} />);
        fireEvent.click(screen.getByRole("button", { name: "viewer" }));
        expect(screen.getByRole("button", { name: "viewer" }).disabled).toBe(true);
        await act(async () => { finish(); });
        await waitFor(() => expect(screen.getByRole("button", { name: "viewer" }).disabled).toBe(false));
    });
});
