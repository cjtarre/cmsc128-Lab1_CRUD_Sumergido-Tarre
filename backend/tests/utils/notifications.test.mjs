import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const mock = require("mock-require");

const supabase = { from: vi.fn() };

mock(path.resolve("config/supabaseAdmin.js"), supabase);

const {
    notify,
    removeInviteNotifications,
} = require("../../utils/notifications.js");

beforeEach(() => {
    vi.clearAllMocks();
});

describe("notifications utils", () => {
    describe("notify", () => {
        it("does nothing when there are no recipients", async () => {
            await notify([], "project_deleted");

            expect(supabase.from).not.toHaveBeenCalled();
        });

        it("deduplicates recipients and inserts one row per user", async () => {
            const query = {
                insert: vi.fn().mockResolvedValue({
                    error: null,
                }),
            };

            supabase.from.mockReturnValue(query);

            await notify(
                ["user-1", "user-2", "user-1"],
                "project_restored",
                {
                    actorId: "owner-1",
                    data: {
                        project_id: 7,
                        project_name: "CMSC 128",
                    },
                }
            );

            expect(supabase.from).toHaveBeenCalledWith(
                "notifications"
            );

            expect(query.insert).toHaveBeenCalledWith([
                {
                    user_id: "user-1",
                    type: "project_restored",
                    actor_id: "owner-1",
                    data: {
                        project_id: 7,
                        project_name: "CMSC 128",
                    },
                },
                {
                    user_id: "user-2",
                    type: "project_restored",
                    actor_id: "owner-1",
                    data: {
                        project_id: 7,
                        project_name: "CMSC 128",
                    },
                },
            ]);
        });

        it("uses null actor and empty data by default", async () => {
            const query = {
                insert: vi.fn().mockResolvedValue({
                    error: null,
                }),
            };

            supabase.from.mockReturnValue(query);

            await notify(["user-1"], "system");

            expect(query.insert).toHaveBeenCalledWith([
                {
                    user_id: "user-1",
                    type: "system",
                    actor_id: null,
                    data: {},
                },
            ]);
        });

        it("throws when notification insertion fails", async () => {
            const error = new Error("Insert failed");

            const query = {
                insert: vi.fn().mockResolvedValue({
                    error,
                }),
            };

            supabase.from.mockReturnValue(query);

            await expect(
                notify(["user-1"], "project_deleted")
            ).rejects.toBe(error);
        });
    });

    describe("removeInviteNotifications", () => {
        it("does nothing when there are no invite ids", async () => {
            await removeInviteNotifications([]);

            expect(supabase.from).not.toHaveBeenCalled();
        });

        it("removes project invite notifications using string invite ids", async () => {
            const query = {
                delete: vi.fn(),
                eq: vi.fn(),
                in: vi.fn(),
            };

            query.delete.mockReturnValue(query);
            query.eq.mockReturnValue(query);
            query.in.mockResolvedValue({
                error: null,
            });

            supabase.from.mockReturnValue(query);

            await removeInviteNotifications([5, 12]);

            expect(supabase.from).toHaveBeenCalledWith(
                "notifications"
            );

            expect(query.delete).toHaveBeenCalled();

            expect(query.eq).toHaveBeenCalledWith(
                "type",
                "project_invite"
            );

            expect(query.in).toHaveBeenCalledWith(
                "data->>invite_id",
                ["5", "12"]
            );
        });

        it("throws when invite-notification cleanup fails", async () => {
            const error = new Error("Delete failed");

            const query = {
                delete: vi.fn(),
                eq: vi.fn(),
                in: vi.fn(),
            };

            query.delete.mockReturnValue(query);
            query.eq.mockReturnValue(query);
            query.in.mockResolvedValue({ error });

            supabase.from.mockReturnValue(query);

            await expect(
                removeInviteNotifications([5])
            ).rejects.toBe(error);
        });
    });
});
