import { describe, expect, it } from "vitest";

import { filterProjectInvitations } from "../../src/features/projects/utils/projectUtils";

describe("filterProjectInvitations", () => {
    const invitations = [
        {
            id: "one",
            project: { project_name: "CMSC 128 Team" },
            inviter: { display_name: "Sam Rivera", username: "snep" },
            role: "editor",
        },
        {
            id: "two",
            project: { project_name: "Sprint Review" },
            inviter: { username: "alex" },
            role: "viewer",
        },
    ];

    it("matches project titles, inviter names, usernames, and roles", () => {
        for (const search of [" cmsc ", "RIVERA", "snep", "EDITOR"]) {
            expect(filterProjectInvitations(invitations, search)).toEqual([invitations[0]]);
        }
        for (const search of ["sprint", "alex", "viewer"]) {
            expect(filterProjectInvitations(invitations, search)).toEqual([invitations[1]]);
        }
    });

    it("returns all invitations for an empty search and none for no match", () => {
        expect(filterProjectInvitations(invitations, " ")).toEqual(invitations);
        expect(filterProjectInvitations(invitations, "not-found")).toEqual([]);
        expect(invitations).toHaveLength(2);
    });
});
