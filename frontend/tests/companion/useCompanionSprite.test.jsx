import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { COMPANION_STATE } from "../../src/features/companion/companionStates";
import { useCompanionSprite } from "../../src/features/companion/hooks/useCompanionSprite";

it("cycles idle sprites and resets the frame when the companion state changes", () => {
    vi.useFakeTimers();

    const { result, rerender, unmount } = renderHook(({ state }) => useCompanionSprite(state), {
        initialProps: { state: COMPANION_STATE.IDLE },
    });

    try {
        expect(result.current).toContain("idle_1.png");
        act(() => vi.advanceTimersByTime(1200));
        expect(result.current).toContain("idle_2.png");

        rerender({ state: COMPANION_STATE.SLEEPING });
        expect(result.current).toContain("sleeping.png");
        act(() => vi.advanceTimersByTime(1200));
        expect(result.current).toContain("sleeping.png");
    } finally {
        unmount();
        vi.useRealTimers();
    }
});
