import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("should handle undefined and null values", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("should handle empty strings", () => {
    expect(cn("foo", "", "bar")).toBe("foo bar");
  });

  it("should handle arrays of classes", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("should handle objects with boolean values", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("should handle Tailwind conflicts with clsx", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("should handle complex Tailwind class merging", () => {
    expect(cn("bg-red-500 hover:bg-red-600", "bg-blue-500")).toBe(
      "hover:bg-red-600 bg-blue-500",
    );
  });

  it("should handle multiple conflicting classes", () => {
    expect(cn("text-sm font-bold", "text-lg font-normal")).toBe(
      "text-lg font-normal",
    );
  });

  it("should return empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("should return empty string for empty array", () => {
    expect(cn([])).toBe("");
  });

  it("should return empty string for empty object", () => {
    expect(cn({})).toBe("");
  });

  it("should handle zero in conditional classes", () => {
    // clsx filters out falsy values like 0, so "bar" is also filtered due to 0 &&
    expect(cn("foo", 0 && "bar", "baz")).toBe("foo baz");
  });

  it("should handle nested arrays", () => {
    expect(cn([["foo", "bar"], "baz"])).toBe("foo bar baz");
  });

  it("should handle mixed types", () => {
    expect(
      cn("base-class", { active: true, disabled: false }, ["extra-class"]),
    ).toBe("base-class active extra-class");
  });

  it("should handle Tailwind important variants", () => {
    expect(cn("!text-sm", "!text-lg")).toBe("!text-lg");
  });

  it("should handle Tailwind arbitrary values", () => {
    expect(cn("[color:red]", "[color:blue]")).toBe("[color:blue]");
  });

  it("should handle responsive classes correctly", () => {
    expect(cn("p-4 md:p-8", "md:p-6")).toBe("p-4 md:p-6");
  });

  it("should handle state variants correctly", () => {
    expect(cn("bg-red-500 hover:bg-red-600", "hover:bg-blue-600")).toBe(
      "bg-red-500 hover:bg-blue-600",
    );
  });
});
