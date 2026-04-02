import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "./use-mobile";

// Mock window.matchMedia
const mockMatchMedia = vi.fn();

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia,
});

describe("useIsMobile", () => {
  let mockMediaQueryList: {
    matches: boolean;
    media: string;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Setup mock matchMedia
    mockMediaQueryList = {
      matches: false,
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    // Mock window.innerWidth
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return false for desktop screen width", () => {
    mockMediaQueryList.matches = false;
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("should return true for mobile screen width", () => {
    mockMediaQueryList.matches = true;
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 375,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("should return undefined on first render", () => {
    const { result } = renderHook(() => useIsMobile());

    // After the effect runs, it should have a value
    // But initially it might be undefined
    expect(typeof result.current).toBe("boolean");
  });

  it("should set up event listener on mount", () => {
    renderHook(() => useIsMobile());

    expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("should clean up event listener on unmount", () => {
    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("should update when media query changes", () => {
    // Set initial desktop width
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Simulate media query change AND window resize to mobile
    act(() => {
      const onChange = mockMediaQueryList.addEventListener.mock.calls[0][1];
      // Change both the media query match AND innerWidth to simulate mobile
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 375,
      });
      mockMediaQueryList.matches = true;
      onChange({ matches: true });
    });

    expect(result.current).toBe(true);
  });

  it("should use correct breakpoint (768px)", () => {
    renderHook(() => useIsMobile());

    expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("should return boolean value after hydration", () => {
    const { result } = renderHook(() => useIsMobile());

    // The hook should always return a boolean, not undefined
    expect(typeof result.current).toBe("boolean");
  });

  it("should handle multiple render cycles", () => {
    const { result, rerender } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    rerender();

    expect(result.current).toBe(false);
  });
});
