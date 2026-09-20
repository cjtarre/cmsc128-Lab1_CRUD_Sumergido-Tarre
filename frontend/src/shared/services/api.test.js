import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    axiosConfig: null,
    requestInterceptor: null,

    apiInstance: {
        interceptors: {
            request: {
                use: vi.fn((onFulfilled) => {
                    mocks.requestInterceptor = onFulfilled;
                }),
            },
        },
    },
}));

vi.mock("axios", () => ({
    default: {
        create: vi.fn((config) => {
            mocks.axiosConfig = config;
            return mocks.apiInstance;
        }),
    },
}));

import api from "./api";

describe("api", () => {
    beforeEach(() => {
        globalThis.localStorage = {
            getItem: vi.fn(),
        };
    });

    it("creates an Axios instance with the expected configuration", () => {
        expect(mocks.axiosConfig).toEqual({
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

        const result = mocks.requestInterceptor(config);

        expect(localStorage.getItem).toHaveBeenCalledWith("accessToken");
        expect(result.headers.Authorization).toBe("Bearer test-token");
    });

    it("does not add an Authorization header when there is no access token", () => {
        localStorage.getItem.mockReturnValue(null);

        const config = {
            headers: {},
        };

        const result = mocks.requestInterceptor(config);

        expect(localStorage.getItem).toHaveBeenCalledWith("accessToken");
        expect(result.headers.Authorization).toBeUndefined();
    });

    it("returns the original request config", () => {
        localStorage.getItem.mockReturnValue(null);

        const config = {
            headers: {},
            url: "/api/tasks",
        };

        const result = mocks.requestInterceptor(config);

        expect(result).toBe(config);
    });
});