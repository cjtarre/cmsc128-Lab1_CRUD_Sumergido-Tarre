import { describe, expect, it, vi } from "vitest";

import { handleCreateProject, handleDeleteProject, handleRestoreProject, handleUpdateProject } from "../../src/features/projects/handlers/projectHandlers";
import { handleInviteMember, handleRemoveMember } from "../../src/features/projects/handlers/projectMemberHandlers";

const event = () => ({ preventDefault: vi.fn() });

describe("projectHandlers", () => {
    it("rejects an empty project name", async () => {
        const e = event(), setError = vi.fn(), onSubmit = vi.fn();

        await handleCreateProject(e, {
            projectName: "   ", onSubmit, onClose: vi.fn(), setProjectName: vi.fn(),
            setError, setSubmitting: vi.fn(),
        });

        expect(e.preventDefault).toHaveBeenCalled();
        expect(setError).toHaveBeenCalledWith("Project name is required.");
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("trims and submits a project name then resets on success", async () => {
        const e = event(), onSubmit = vi.fn().mockResolvedValue(true), onClose = vi.fn();
        const setProjectName = vi.fn(), setError = vi.fn(), setSubmitting = vi.fn();

        await handleCreateProject(e, {
            projectName: "  Takda Project  ", onSubmit, onClose,
            setProjectName, setError, setSubmitting,
        });

        expect(onSubmit).toHaveBeenCalledWith("Takda Project");
        expect(setSubmitting).toHaveBeenNthCalledWith(1, true);
        expect(setError).toHaveBeenCalledWith("");
        expect(setProjectName).toHaveBeenCalledWith("");
        expect(onClose).toHaveBeenCalled();
        expect(setSubmitting).toHaveBeenLastCalledWith(false);
    });

    it("does not close the create form when submission fails", async () => {
        const onClose = vi.fn(), setProjectName = vi.fn(), setSubmitting = vi.fn();

        await handleCreateProject(event(), {
            projectName: "Project",
            onSubmit: vi.fn().mockResolvedValue(false),
            onClose, setProjectName, setError: vi.fn(), setSubmitting,
        });

        expect(onClose).not.toHaveBeenCalled();
        expect(setProjectName).not.toHaveBeenCalled();
        expect(setSubmitting).toHaveBeenLastCalledWith(false);
    });

    it("updates the selected project", async () => {
        const updateProject = vi.fn().mockResolvedValue(true);
        const data = { project_name: "Updated" };

        await expect(handleUpdateProject(data, { project: { id: 8 }, updateProject })).resolves.toBe(true);
        expect(updateProject).toHaveBeenCalledWith(8, data);
    });

    it("does not update when no project is selected", async () => {
        const updateProject = vi.fn();

        await expect(handleUpdateProject({}, { project: null, updateProject })).resolves.toBe(false);
        expect(updateProject).not.toHaveBeenCalled();
    });

    it("runs delete success callback only when deletion succeeds", async () => {
        const onSuccess = vi.fn();

        await handleDeleteProject({
            project: { id: 1 },
            deleteProject: vi.fn().mockResolvedValue(true),
            onSuccess,
        });

        expect(onSuccess).toHaveBeenCalledOnce();
    });

    it("runs restore success callback only when restoration succeeds", async () => {
        const onSuccess = vi.fn();

        await handleRestoreProject({
            project: { id: 1 },
            restoreProject: vi.fn().mockResolvedValue(false),
            onSuccess,
        });

        expect(onSuccess).not.toHaveBeenCalled();
    });
});

describe("projectMemberHandlers", () => {
    it("removes a member and runs the success callback", async () => {
        const member = { user_id: 2 }, removeMember = vi.fn().mockResolvedValue(true), onSuccess = vi.fn();

        await handleRemoveMember(member, removeMember, onSuccess);

        expect(removeMember).toHaveBeenCalledWith(member);
        expect(onSuccess).toHaveBeenCalled();
    });

    it("does nothing when no member is selected", async () => {
        const removeMember = vi.fn();

        await handleRemoveMember(null, removeMember, vi.fn());

        expect(removeMember).not.toHaveBeenCalled();
    });

    it("trims and submits an invitation then resets on success", async () => {
        const e = event(), onSubmit = vi.fn().mockResolvedValue(true), onClose = vi.fn();
        const setIdentifier = vi.fn(), setRole = vi.fn(), setSubmitting = vi.fn();

        await handleInviteMember(e, {
            identifier: "  user@example.com  ", role: "editor", onSubmit, onClose,
            setIdentifier, setRole, setSubmitting, defaultRole: "viewer",
        });

        expect(e.preventDefault).toHaveBeenCalled();
        expect(onSubmit).toHaveBeenCalledWith("user@example.com", "editor");
        expect(setIdentifier).toHaveBeenCalledWith("");
        expect(setRole).toHaveBeenCalledWith("viewer");
        expect(onClose).toHaveBeenCalled();
        expect(setSubmitting).toHaveBeenLastCalledWith(false);
    });

    it("does not submit an empty invitation identifier", async () => {
        const onSubmit = vi.fn();

        await handleInviteMember(event(), {
            identifier: "   ", role: "viewer", onSubmit, onClose: vi.fn(),
            setIdentifier: vi.fn(), setRole: vi.fn(), setSubmitting: vi.fn(),
            defaultRole: "viewer",
        });

        expect(onSubmit).not.toHaveBeenCalled();
    });
});
