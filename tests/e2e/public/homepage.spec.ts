import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Check page title
    await expect(page).toHaveTitle(/Create Next App/);

    // Check for navbar
    const navbar = page.locator("nav");
    await expect(navbar).toBeVisible();

    // Check for brand name
    await expect(page.locator("text=StarterKit")).toBeVisible();

    // Check navigation links
    await expect(page.locator('a:has-text("Home")')).toBeVisible();

    // Check theme toggle button
    const themeToggle = page.locator(
      'button[aria-label="Toggle theme"], button:has(svg)',
    );
    await expect(themeToggle).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: "screenshots/homepage.png" });
  });

  test("should show login/signup buttons when not authenticated", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000");

    // Check for login button
    await expect(page.locator('a:has-text("Login")')).toBeVisible();

    // Check for signup button
    await expect(page.locator('a:has-text("Sign Up")')).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Click login button
    await page.click('a:has-text("Login")');

    // Should be on login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
  });

  test("should navigate to signup page", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Click signup button
    await page.click('a:has-text("Sign Up")');

    // Should be on signup page
    await expect(page).toHaveURL(/\/signup/);
    await expect(
      page.locator('h1:has-text("Create your account")'),
    ).toBeVisible();
  });
});
