import { describe, expect, it } from "vitest";

import { PROJECT_ROLE } from "../../src/features/projects/constants/projectOptions";
import { canEditProject, filterCollaborativeProjects, formatDeletedProjectDate, isProjectOwner } from "../../src/features/projects/utils/projectUtils";

describe("projectUtils", () => {
    it("allows owners and editors to edit projects", () => {
        expect(canEditProject(PROJECT_ROLE.OWNER)).toBe(true);
        expect(canEditProject(PROJECT_ROLE.EDITOR)).toBe(true);
    });

    it("does not allow other roles to edit projects", () => {
        expect(canEditProject("viewer")).toBe(false);
        expect(canEditProject(undefined)).toBe(false);
    });

    it("identifies only the owner role as project owner", () => {
        expect(isProjectOwner(PROJECT_ROLE.OWNER)).toBe(true);
        expect(isProjectOwner(PROJECT_ROLE.EDITOR)).toBe(false);
    });

    it("excludes default projects and filters names case-insensitively", () => {
        const projects = [
            { id: 1, project_name: "My Tasks", is_default: true },
            { id: 2, project_name: "CMSC 128 Project", is_default: false },
            { id: 3, project_name: "Personal Work", is_default: false },
        ];

        expect(filterCollaborativeProjects(projects, " cmsc ")).toEqual([projects[1]]);
    });

    it("returns all collaborative projects for an empty search", () => {
        const projects = [
            { id: 1, project_name: "Default", is_default: true },
            { id: 2, project_name: "Alpha", is_default: false },
            { id: 3, project_name: "Beta", is_default: false },
        ];

        expect(filterCollaborativeProjects(projects, " ")).toEqual([projects[1], projects[2]]);
    });

    it("handles projects without a project name", () => {
        expect(filterCollaborativeProjects([
            { id: 1, is_default: false },
            { id: 2, project_name: "Takda", is_default: false },
        ], "takda")).toEqual([{ id: 2, project_name: "Takda", is_default: false }]);
    });

    it("returns a fallback when deletion time is missing", () => {
        expect(formatDeletedProjectDate(null)).toBe("Recently deleted");
    });

    it("formats a supplied deletion date", () => {
        const result = formatDeletedProjectDate("2026-10-20T12:00:00Z");
        expect(result).toMatch(/^Deleted /);
        expect(result).toContain("2026");
    });
});
