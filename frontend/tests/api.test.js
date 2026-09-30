import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
    const state = {
        axiosConfig: null,
        requestInterceptor: null,
        requestErrorInterceptor: null,
        responseInterceptor: null,
        responseErrorInterceptor: null,
    };

    const apiInstance = vi.fn();

    apiInstance.get = vi.fn();
    apiInstance.post = vi.fn();
    apiInstance.put = vi.fn();
    apiInstance.delete = vi.fn();
    apiInstance.patch = vi.fn();

    apiInstance.interceptors = {
        request: {
            use: vi.fn((onFulfilled, onRejected) => {
                state.requestInterceptor = onFulfilled;
                state.requestErrorInterceptor = onRejected;
            }),
        },
        response: {
            use: vi.fn((onFulfilled, onRejected) => {
                state.responseInterceptor = onFulfilled;
                state.responseErrorInterceptor = onRejected;
            }),
        },
    };

    return {
        state,
        apiInstance,
    };
});

vi.mock("axios", () => ({
    default: {
        create: vi.fn((config) => {
            mocks.state.axiosConfig = config;
            return mocks.apiInstance;
        }),
    },
}));

import api from "../src/shared/services/api";

describe("api", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        globalThis.localStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
        };

        globalThis.window = {
            location: {
                href: "",
            },
        };
    });

    it("creates an Axios instance with the expected configuration", () => {
        expect(mocks.state.axiosConfig).toEqual({
            baseURL: expect.any(String),
            headers: {
                "Content-Type": "application/json",
            },
        });

        expect(api).toBe(mocks.apiInstance);
    });

    it("adds the access token to the Authorization header", () => {
        localStorage.getItem.mockReturnValue("test-token");

        const config = {
            headers: {},
        };

        const result = mocks.state.requestInterceptor(config);

        expect(localStorage.getItem).toHaveBeenCalledWith("accessToken");
        expect(result.headers.Authorization).toBe("Bearer test-token");
    });

    it("does not add an Authorization header when there is no access token", () => {
        localStorage.getItem.mockReturnValue(null);

        const config = {
            headers: {},
        };

        const result = mocks.state.requestInterceptor(config);

        expect(localStorage.getItem).toHaveBeenCalledWith("accessToken");
        expect(result.headers.Authorization).toBeUndefined();
    });

    it("returns the original request config", () => {
        localStorage.getItem.mockReturnValue(null);

        const config = {
            headers: {},
            url: "/api/tasks",
        };

        const result = mocks.state.requestInterceptor(config);

        expect(result).toBe(config);
    });

    it("returns successful responses unchanged", () => {
        const response = {
            status: 200,
            data: { message: "Success" },
        };

        expect(mocks.state.responseInterceptor(response)).toBe(response);
    });

    it("refreshes the session and retries the request after a 401 response", async () => {
        localStorage.getItem.mockImplementation((key) => {
            if (key === "refreshToken") {
                return "old-refresh-token";
            }

            return null;
        });

        mocks.apiInstance.post.mockResolvedValue({
            data: {
                session: {
                    access_token: "new-access-token",
                    refresh_token: "new-refresh-token",
                },
            },
        });

        const retriedResponse = {
            status: 200,
            data: {
                message: "Request succeeded after refresh",
            },
        };

        mocks.apiInstance.mockResolvedValue(retriedResponse);

        const originalRequest = {
            url: "/api/tasks",
            headers: {},
        };

        const error = {
            config: originalRequest,
            response: {
                status: 401,
            },
        };

        const result = await mocks.state.responseErrorInterceptor(error);

        expect(localStorage.getItem).toHaveBeenCalledWith("refreshToken");

        expect(mocks.apiInstance.post).toHaveBeenCalledWith(
            "/api/auth/refresh",
            {
                refresh_token: "old-refresh-token",
            }
        );

        expect(localStorage.setItem).toHaveBeenCalledWith(
            "accessToken",
            "new-access-token"
        );

        expect(localStorage.setItem).toHaveBeenCalledWith(
            "refreshToken",
            "new-refresh-token"
        );

        expect(originalRequest._retry).toBe(true);

        expect(originalRequest.headers.Authorization).toBe(
            "Bearer new-access-token"
        );

        expect(mocks.apiInstance).toHaveBeenCalledWith(originalRequest);

        expect(result).toBe(retriedResponse);
    });

    it("clears stored tokens when session refresh fails", async () => {
        localStorage.getItem.mockImplementation((key) => {
            if (key === "refreshToken") {
                return "invalid-refresh-token";
            }
    
            return null;
        });
    
        mocks.apiInstance.post.mockRejectedValue(
            new Error("Invalid refresh token")
        );
    
        const originalRequest = {
            url: "/api/tasks",
            headers: {},
        };
    
        const error = {
            config: originalRequest,
            response: {
                status: 401,
            },
        };
    
        await expect(
            mocks.state.responseErrorInterceptor(error)
        ).rejects.toBe(error);
    
        expect(mocks.apiInstance.post).toHaveBeenCalledWith(
            "/api/auth/refresh",
            {
                refresh_token: "invalid-refresh-token",
            }
        );
    
        expect(localStorage.removeItem).toHaveBeenCalledWith("accessToken");
        expect(localStorage.removeItem).toHaveBeenCalledWith("refreshToken");
    
        expect(window.location.href).toBe("/");
    });
});