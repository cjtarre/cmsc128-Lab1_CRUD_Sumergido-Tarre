import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { inviteService } from "../../src/features/projects/services/inviteService";
import { useInviteResponse } from "../../src/features/notifications/hooks/useInviteResponse";

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("react-router-dom", () => ({
    useNavigate: vi.fn(),
}));

vi.mock("../../src/features/projects/services/inviteService", () => ({
    inviteService: {
        acceptInvite: vi.fn(),
        declineInvite: vi.fn(),
    },
}));

describe("useInviteResponse", () => {
    let navigate;

    const notification = {
        id: 20,
        invite_status: "pending",
        data: {
            invite_id: 8,
            project_id: 15,
            project_name: "Takda Team",
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        navigate = vi.fn();
        useNavigate.mockReturnValue(navigate);
        inviteService.acceptInvite.mockResolvedValue({});
        inviteService.declineInvite.mockResolvedValue({});
    });

    it("accepts an invitation and refreshes notification state", async () => {
        const onRead = vi.fn().mockResolvedValue(undefined);
        const onRefresh = vi.fn().mockResolvedValue(undefined);
        const dispatchSpy = vi.spyOn(window, "dispatchEvent");

        const { result } = renderHook(() =>
            useInviteResponse(notification, onRead, onRefresh, vi.fn())
        );

        await act(async () => {
            await result.current.respond(true);
        });

        expect(inviteService.acceptInvite).toHaveBeenCalledWith(8);
        expect(toast.success).toHaveBeenCalledWith("Joined Takda Team.");
        expect(onRead).toHaveBeenCalledWith(20);
        expect(onRefresh).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({
            type: "takda:invites-changed",
        }));
        expect(result.current.responding).toBe(false);

        dispatchSpy.mockRestore();
    });

    it("declines an invitation", async () => {
        const onRead = vi.fn();
        const onRefresh = vi.fn();

        const { result } = renderHook(() =>
            useInviteResponse(notification, onRead, onRefresh, vi.fn())
        );

        await act(async () => {
            await result.current.respond(false);
        });

        expect(inviteService.declineInvite).toHaveBeenCalledWith(8);
        expect(toast.success).toHaveBeenCalledWith("Invitation declined.");
        expect(onRead).toHaveBeenCalledWith(20);
        expect(onRefresh).toHaveBeenCalled();
    });

    it("does nothing when the notification has no invite id", async () => {
        const { result } = renderHook(() =>
            useInviteResponse({ id: 1, data: {} }, vi.fn(), vi.fn(), vi.fn())
        );

        await act(async () => {
            await result.current.respond(true);
        });

        expect(inviteService.acceptInvite).not.toHaveBeenCalled();
        expect(inviteService.declineInvite).not.toHaveBeenCalled();
    });

    it("shows the API error when responding fails", async () => {
        inviteService.acceptInvite.mockRejectedValue({
            response: { data: { error: "Invite expired" } },
        });

        const { result } = renderHook(() =>
            useInviteResponse(notification, vi.fn(), vi.fn(), vi.fn())
        );

        await act(async () => {
            await result.current.respond(true);
        });

        expect(toast.error).toHaveBeenCalledWith("Invite expired");
        expect(result.current.responding).toBe(false);
    });

    it("opens an accepted invitation project", async () => {
        const accepted = { ...notification, invite_status: "accepted" };
        const onRead = vi.fn();
        const onClose = vi.fn();

        const { result } = renderHook(() =>
            useInviteResponse(accepted, onRead, vi.fn(), onClose)
        );

        await act(async () => {
            await result.current.open();
        });

        expect(onRead).toHaveBeenCalledWith(20);
        expect(onClose).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith("/projects/15");
    });

    it("does not navigate when the invitation is not accepted", async () => {
        const onRead = vi.fn();

        const { result } = renderHook(() =>
            useInviteResponse(notification, onRead, vi.fn(), vi.fn())
        );

        await act(async () => {
            await result.current.open();
        });

        expect(onRead).toHaveBeenCalledWith(20);
        expect(navigate).not.toHaveBeenCalled();
    });

    it("does not navigate without a project id", async () => {
        const accepted = {
            id: 20,
            invite_status: "accepted",
            data: { invite_id: 8 },
        };

        const { result } = renderHook(() =>
            useInviteResponse(accepted, vi.fn(), vi.fn(), vi.fn())
        );

        await act(async () => {
            await result.current.open();
        });

        expect(navigate).not.toHaveBeenCalled();
    });
});
