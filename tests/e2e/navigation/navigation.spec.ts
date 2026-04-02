import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate from home to login", async ({ page }) => {
    await page.goto("/");

    await page.click('a:has-text("Login")');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h1")).toContainText("Welcome back");
  });

  test("should navigate from home to signup", async ({ page }) => {
    await page.goto("/");

    await page.click('a:has-text("Sign Up")');
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.locator("h1")).toContainText("Create your account");
  });

  test("should navigate from login to signup", async ({ page }) => {
    await page.goto("/login");

    await page.click('a[href="/signup"]');
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.locator("h1")).toContainText("Create your account");
  });

  test("should navigate from signup to login", async ({ page }) => {
    await page.goto("/signup");

    await page.click('a[href="/login"]');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h1")).toContainText("Welcome back");
  });

  test("should have working browser back/forward buttons", async ({ page }) => {
    await page.goto("/");

    await page.click('a:has-text("Login")');
    await expect(page).toHaveURL(/\/login/);

    await page.goBack();
    await expect(page).toHaveURL("/");

    await page.goForward();
    await expect(page).toHaveURL(/\/login/);
  });

  test("should handle direct URL navigation", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/signup");
    await expect(page).toHaveURL(/\/signup/);

    await page.goto("/");
    await expect(page).toHaveURL("/");
  });
});
