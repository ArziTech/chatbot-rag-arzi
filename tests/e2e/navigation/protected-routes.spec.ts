import { expect, test } from "@playwright/test";

test.describe("Navigation - Protected Routes", () => {
  test("should redirect unauthenticated users from protected routes", async ({
    page,
  }) => {
    // Try to access a protected route (adjust the path as needed)
    const protectedRoutes = ["/dashboard", "/profile", "/settings"];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Should redirect to login or show unauthorized message
      const url = page.url();
      expect(url).toMatch(/\/login|\/unauthorized/);
    }
  });

  test("should allow access to public routes", async ({ page }) => {
    const publicRoutes = ["/", "/login", "/signup"];

    for (const route of publicRoutes) {
      await page.goto(route);

      // Should successfully load the page
      await expect(page).toHaveURL(route);
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("should show login/signup buttons on homepage when not authenticated", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator('a:has-text("Login")')).toBeVisible();
    await expect(page.locator('a:has-text("Sign Up")')).toBeVisible();
  });

  test("should navigate correctly using navbar links", async ({ page }) => {
    await page.goto("/");

    // Test Home link
    const homeLink = page.locator('a:has-text("Home")').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL("/");
    }
  });
});
