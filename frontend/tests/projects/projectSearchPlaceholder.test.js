import { describe, expect, it } from "vitest";

import { getProjectsSearchPlaceholder } from "../../src/features/projects/utils/projectUtils";

describe("getProjectsSearchPlaceholder", () => {
    const project = { id: 1, project_name: "Demo", is_default: false };
    const personalProject = { id: 2, project_name: "My Tasks", is_default: true };
    const invitation = { id: 3, project: { project_name: "Team" } };

    it("includes both sections when both have records", () => {
        expect(getProjectsSearchPlaceholder([project], [invitation])).toBe("Search projects and invitations...");
    });

    it("uses project-only or invitation-only text when appropriate", () => {
        expect(getProjectsSearchPlaceholder([project], [])).toBe("Search projects...");
        expect(getProjectsSearchPlaceholder([], [invitation])).toBe("Search invitations...");
        expect(getProjectsSearchPlaceholder([personalProject], [invitation])).toBe("Search invitations...");
    });

    it("defaults to projects when neither section has records", () => {
        expect(getProjectsSearchPlaceholder([], [])).toBe("Search projects...");
        expect(getProjectsSearchPlaceholder([personalProject], [])).toBe("Search projects...");
    });
});
