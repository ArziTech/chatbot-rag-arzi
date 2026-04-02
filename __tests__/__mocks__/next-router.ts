import { vi } from "vitest";

// Mock router push function
export const mockPush = vi.fn();
export const mockReplace = vi.fn();
export const mockPrefetch = vi.fn();
export const mockBack = vi.fn();
export const mockRefresh = vi.fn();

// Mock router
export const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  prefetch: mockPrefetch,
  back: mockBack,
  refresh: mockRefresh,
};

// Helper to get router push calls
export const getPushCalls = () => mockPush.mock.calls;
export const getReplaceCalls = () => mockReplace.mock.calls;
export const getBackCalls = () => mockBack.mock.calls;

// Helper to reset router mocks
export const resetRouterMocks = () => {
  mockPush.mockReset();
  mockReplace.mockReset();
  mockPrefetch.mockReset();
  mockBack.mockReset();
  mockRefresh.mockReset();
};

// Helper to set router push mock implementation
export const setPushMock = (impl: () => void | Promise<void>) => {
  mockPush.mockImplementation(impl);
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));
