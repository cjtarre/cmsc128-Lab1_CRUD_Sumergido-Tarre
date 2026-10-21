import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const mock = require("mock-require");

const USER_ID = "user-1";
const PROJECT_ID = 7;

const supabase = {
    from: vi.fn(),
    rpc: vi.fn(),
};

const validation = {
    validateProjectName: vi.fn(),
};

const notifications = {
    notify: vi.fn(),
    removeInviteNotifications: vi.fn(),
};

mock(path.resolve("config/supabaseAdmin.js"), supabase);
mock(path.resolve("utils/validation.js"), validation);
mock(path.resolve("utils/notifications.js"), notifications);

const {
    getAllProjects,
    createProject,
    deleteProject,
    updateProject,
    restoreProject,
    getProjectActivity,
} = require("../../controllers/projectController.js");

const createResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
});

const makeQuery = (result = { data: null, error: null }) => {
    const query = {};

    [
        "select", "insert", "update", "delete",
        "eq", "neq", "is", "not", "in", "order", "limit",
    ].forEach((method) => {
        query[method] = vi.fn().mockReturnValue(query);
    });

    query.single = vi.fn().mockResolvedValue(result);
    query.maybeSingle = vi.fn().mockResolvedValue(result);

    query.then = (resolve, reject) =>
        Promise.resolve(result).then(resolve, reject);

    return query;
};

const setTableQueues = (tables) => {
    const queues = Object.fromEntries(
        Object.entries(tables).map(([key, value]) => [
            key,
            Array.isArray(value) ? [...value] : [value],
        ])
    );

    supabase.from.mockImplementation((table) => {
        const query = queues[table]?.shift();

        if (!query) {
            throw new Error(`No mock query configured for table: ${table}`);
        }

        return query;
    });
};

beforeEach(() => {
    vi.clearAllMocks();
    validation.validateProjectName.mockReturnValue(null);
    notifications.notify.mockResolvedValue(undefined);
    notifications.removeInviteNotifications.mockResolvedValue(undefined);
});

describe("projectController", () => {
    describe("getAllProjects", () => {
        it("returns active projects with task and member summaries", async () => {
            const projectsQuery = makeQuery({
                data: [
                    {
                        role: "editor",
                        projects: {
                            id: 2,
                            project_name: "Second",
                            is_default: false,
                            created_at: "2026-01-01T00:00:00Z",
                        },
                    },
                    {
                        role: "owner",
                        projects: {
                            id: 1,
                            project_name: "Default",
                            is_default: true,
                            created_at: "2026-02-01T00:00:00Z",
                        },
                    },
                ],
                error: null,
            });

            const tasksQuery = makeQuery({
                data: [
                    { task_id: 1, project_id: 1 },
                    { task_id: 2, project_id: 1 },
                    { task_id: 3, project_id: 2 },
                ],
                error: null,
            });

            const membersQuery = makeQuery({
                data: [
                    { project_id: 1, user_id: "u1", created_at: "2026-01-01" },
                    { project_id: 1, user_id: "u2", created_at: "2026-01-02" },
                    { project_id: 2, user_id: "u3", created_at: "2026-01-03" },
                ],
                error: null,
            });

            const profilesQuery = makeQuery({
                data: [
                    { user_id: "u1", username: "owner", display_name: "Owner" },
                    { user_id: "u2", username: "member", display_name: "Member" },
                    { user_id: "u3", username: "editor", display_name: "Editor" },
                ],
                error: null,
            });

            setTableQueues({
                project_user: [projectsQuery, membersQuery],
                tasks: tasksQuery,
                profiles: profilesQuery,
            });

            const req = { user: { id: USER_ID }, query: {} };
            const res = createResponse();

            await getAllProjects(req, res);

            expect(projectsQuery.is).toHaveBeenCalledWith(
                "projects.deleted_at",
                null
            );

            expect(res.status).toHaveBeenCalledWith(200);

            const returned = res.json.mock.calls[0][0];

            expect(returned.map((project) => project.id)).toEqual([1, 2]);

            expect(returned[0]).toMatchObject({
                id: 1,
                role: "owner",
                task_count: 2,
                member_count: 2,
            });

            expect(returned[0].members).toEqual([
                {
                    user_id: "u1",
                    username: "owner",
                    display_name: "Owner",
                },
                {
                    user_id: "u2",
                    username: "member",
                    display_name: "Member",
                },
            ]);

            expect(returned[1]).toMatchObject({
                id: 2,
                role: "editor",
                task_count: 1,
                member_count: 1,
            });
        });

        it("returns deleted owner projects without loading summaries", async () => {
            const query = makeQuery({
                data: [
                    {
                        role: "owner",
                        projects: {
                            id: 9,
                            project_name: "Deleted",
                            is_default: false,
                            deleted_at: "2026-10-01",
                            created_at: "2026-01-01",
                        },
                    },
                ],
                error: null,
            });

            setTableQueues({ project_user: query });

            const req = {
                user: { id: USER_ID },
                query: { deleted: "true" },
            };

            const res = createResponse();

            await getAllProjects(req, res);

            expect(query.eq).toHaveBeenCalledWith("role", "owner");
            expect(query.not).toHaveBeenCalledWith(
                "projects.deleted_at",
                "is",
                null
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([
                expect.objectContaining({
                    id: 9,
                    role: "owner",
                }),
            ]);

            expect(supabase.from).toHaveBeenCalledTimes(1);
        });
    });

    describe("createProject", () => {
        it("rejects an invalid project name", async () => {
            validation.validateProjectName.mockReturnValue(
                "Project name is required"
            );

            const req = {
                user: { id: USER_ID },
                body: { project_name: "" },
            };

            const res = createResponse();

            await createProject(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Project name is required",
            });

            expect(supabase.rpc).not.toHaveBeenCalled();
        });

        it("creates an owned project with a trimmed name", async () => {
            supabase.rpc.mockResolvedValue({
                data: {
                    id: PROJECT_ID,
                    project_name: "CMSC 128",
                },
                error: null,
            });

            const req = {
                user: { id: USER_ID },
                body: { project_name: "  CMSC 128  " },
            };

            const res = createResponse();

            await createProject(req, res);

            expect(supabase.rpc).toHaveBeenCalledWith("create_project", {
                p_owner: USER_ID,
                p_name: "CMSC 128",
                p_is_default: false,
            });

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                id: PROJECT_ID,
                project_name: "CMSC 128",
                role: "owner",
            });
        });
    });

    describe("deleteProject", () => {
        it("does not delete the default project", async () => {
            const projectQuery = makeQuery({
                data: {
                    id: PROJECT_ID,
                    project_name: "My Tasks",
                    is_default: true,
                },
                error: null,
            });

            setTableQueues({ projects: projectQuery });

            const req = {
                user: { id: USER_ID },
                projectId: PROJECT_ID,
            };

            const res = createResponse();

            await deleteProject(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "The default project cannot be deleted",
            });
        });

        it("soft-deletes a project and performs collaboration side effects", async () => {
            const fetchQuery = makeQuery({
                data: {
                    id: PROJECT_ID,
                    project_name: "Team Project",
                    is_default: false,
                },
                error: null,
            });

            const updateQuery = makeQuery({
                data: [
                    {
                        id: PROJECT_ID,
                        project_name: "Team Project",
                        deleted_at: "2026-10-21T00:00:00Z",
                    },
                ],
                error: null,
            });

            const memberQuery = makeQuery({
                data: [
                    { user_id: "member-1" },
                    { user_id: "member-2" },
                ],
                error: null,
            });

            const inviteQuery = makeQuery({
                data: [{ id: 11 }, { id: 12 }],
                error: null,
            });

            setTableQueues({
                projects: [fetchQuery, updateQuery],
                project_user: memberQuery,
                project_invite: inviteQuery,
            });

            const req = {
                user: { id: USER_ID },
                projectId: PROJECT_ID,
            };

            const res = createResponse();

            await deleteProject(req, res);

            expect(updateQuery.update).toHaveBeenCalledWith({
                deleted_at: expect.any(String),
            });

            expect(notifications.notify).toHaveBeenCalledWith(
                ["member-1", "member-2"],
                "project_deleted",
                {
                    actorId: USER_ID,
                    data: {
                        project_id: PROJECT_ID,
                        project_name: "Team Project",
                    },
                }
            );

            expect(inviteQuery.update).toHaveBeenCalledWith({
                status: "cancelled",
                responded_at: expect.any(String),
            });

            expect(
                notifications.removeInviteNotifications
            ).toHaveBeenCalledWith([11, 12]);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe("updateProject", () => {
        it("updates project name and appearance", async () => {
            const query = makeQuery({
                data: [
                    {
                        id: PROJECT_ID,
                        project_name: "Updated Project",
                        icon: "plane",
                        accent: "green",
                    },
                ],
                error: null,
            });

            setTableQueues({ projects: query });

            const req = {
                projectId: PROJECT_ID,
                projectRole: "owner",
                body: {
                    project_name: "  Updated Project ",
                    icon: "  plane ",
                    accent: " green ",
                },
            };

            const res = createResponse();

            await updateProject(req, res);

            expect(query.update).toHaveBeenCalledWith({
                project_name: "Updated Project",
                icon: "plane",
                accent: "green",
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                id: PROJECT_ID,
                project_name: "Updated Project",
                icon: "plane",
                accent: "green",
                role: "owner",
            });
        });

        it("returns 404 when the project no longer exists", async () => {
            const query = makeQuery({ data: [], error: null });

            setTableQueues({ projects: query });

            const req = {
                projectId: PROJECT_ID,
                projectRole: "owner",
                body: { project_name: "Updated" },
            };

            const res = createResponse();

            await updateProject(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: "Project not found",
            });
        });
    });

    describe("restoreProject", () => {
        it("restores a project and notifies existing members", async () => {
            const restoreQuery = makeQuery({
                data: [
                    {
                        id: PROJECT_ID,
                        project_name: "Restored Project",
                        deleted_at: null,
                    },
                ],
                error: null,
            });

            const membersQuery = makeQuery({
                data: [
                    { user_id: "member-1" },
                    { user_id: "member-2" },
                ],
                error: null,
            });

            setTableQueues({
                projects: restoreQuery,
                project_user: membersQuery,
            });

            const req = {
                user: { id: USER_ID },
                projectId: PROJECT_ID,
                projectRole: "owner",
            };

            const res = createResponse();

            await restoreProject(req, res);

            expect(restoreQuery.update).toHaveBeenCalledWith({
                deleted_at: null,
            });

            expect(notifications.notify).toHaveBeenCalledWith(
                ["member-1", "member-2"],
                "project_restored",
                {
                    actorId: USER_ID,
                    data: {
                        project_id: PROJECT_ID,
                        project_name: "Restored Project",
                    },
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: PROJECT_ID,
                    role: "owner",
                })
            );
        });

        it("returns 409 when the project is not deleted", async () => {
            const query = makeQuery({ data: [], error: null });

            setTableQueues({ projects: query });

            const req = {
                user: { id: USER_ID },
                projectId: PROJECT_ID,
                projectRole: "owner",
            };

            const res = createResponse();

            await restoreProject(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                error: "Project is not deleted",
            });
        });
    });

    describe("getProjectActivity", () => {
        it("clamps the activity limit to 50", async () => {
            const query = makeQuery({
                data: [{ id: 1, activity_type: "task_created" }],
                error: null,
            });

            setTableQueues({ project_activity: query });

            const req = {
                projectId: PROJECT_ID,
                query: { limit: "999" },
            };

            const res = createResponse();

            await getProjectActivity(req, res);

            expect(query.eq).toHaveBeenCalledWith(
                "project_id",
                PROJECT_ID
            );

            expect(query.limit).toHaveBeenCalledWith(50);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
