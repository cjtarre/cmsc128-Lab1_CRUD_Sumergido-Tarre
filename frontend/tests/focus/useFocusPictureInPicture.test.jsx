import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { useFocusPictureInPicture } from "../../src/features/focus/hooks/useFocusPictureInPicture";

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

it("styles the floating document and resizes it for the player", async () => {
    const floatingDocument = document.implementation.createHTMLDocument();
    const floatingWindow = Object.assign(new EventTarget(), {
        document: floatingDocument,
        resizeTo: vi.fn(),
        close: vi.fn(),
    });
    const requestWindow = vi.fn().mockResolvedValue(floatingWindow);
    vi.stubGlobal("documentPictureInPicture", { requestWindow });

    const { result } = renderHook(() => useFocusPictureInPicture());
    await act(async () => result.current.openFloating());

    expect(requestWindow).toHaveBeenCalledWith({ width: 360, height: 240 });
    expect(floatingDocument.head.querySelector("style").textContent).toContain(".focus-spotify iframe");
    expect(document.head.textContent).not.toContain(".focus-spotify iframe");
    expect(floatingDocument.documentElement.style.getPropertyValue("--embed-compact-height")).toBe("152px");
    expect(floatingDocument.querySelector("main").children).toHaveLength(2);

    result.current.floating.resizePlayer(true);
    expect(floatingWindow.resizeTo).toHaveBeenCalledWith(360, 405);

    act(() => floatingWindow.dispatchEvent(new Event("pagehide")));
    expect(result.current.floating).toBeNull();
});
