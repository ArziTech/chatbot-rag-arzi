import { expect, test } from "@playwright/test";

test.describe("Themes - Theme Toggle", () => {
  test("should display theme toggle button", async ({ page }) => {
    await page.goto("/");

    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeToggle).toBeVisible();
  });

  test("should toggle between light and dark themes", async ({ page }) => {
    await page.goto("/");

    const themeToggle = page.locator('button[aria-label="Toggle theme"]');

    // Get initial theme
    const htmlBefore = page.locator("html");
    const classBefore = await htmlBefore.getAttribute("class");

    // Click theme toggle
    await themeToggle.click();

    // Wait for theme change
    await page.waitForTimeout(100);

    // Get theme after toggle
    const htmlAfter = page.locator("html");
    const classAfter = await htmlAfter.getAttribute("class");

    // Classes should be different
    expect(classBefore).not.toBe(classAfter);
  });

  test("should persist theme preference across page navigation", async ({
    page,
  }) => {
    await page.goto("/");

    const themeToggle = page.locator('button[aria-label="Toggle theme"]');

    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Get theme class
    const html = page.locator("html");
    const classOnFirstPage = await html.getAttribute("class");

    // Navigate to another page
    await page.click('a:has-text("Login")');
    await page.waitForURL(/\/login/);

    // Check if theme is persisted
    const htmlOnLoginPage = page.locator("html");
    const classOnLoginPage = await htmlOnLoginPage.getAttribute("class");

    expect(classOnLoginPage).toBe(classOnFirstPage);
  });

  test("should respect system theme preference on first visit", async ({
    page,
  }) => {
    // Test with dark system preference
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    const html = page.locator("html");
    const classList = await html.getAttribute("class");

    // Should have dark class or theme
    expect(classList).toMatch(/dark|dark=/i);
  });

  test("should show correct icon for current theme", async ({ page }) => {
    await page.goto("/");

    const themeToggle = page.locator('button[aria-label="Toggle theme"]');

    // The button should contain an icon (Sun or Moon)
    const icon = themeToggle.locator("svg");
    await expect(icon).toBeVisible();
  });

  test("should maintain theme when using browser back button", async ({
    page,
  }) => {
    await page.goto("/");

    const themeToggle = page.locator('button[aria-label="Toggle theme"]');

    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(100);

    const htmlFirst = page.locator("html");
    const classFirst = await htmlFirst.getAttribute("class");

    // Navigate to login
    await page.click('a:has-text("Login")');
    await page.waitForURL(/\/login/);

    // Go back
    await page.goBack();
    await page.waitForURL("/");

    const htmlBack = page.locator("html");
    const classBack = await htmlBack.getAttribute("class");

    expect(classBack).toBe(classFirst);
  });
});
