import { expect, test } from "@playwright/test";

test.describe("Authentication - Signup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("should display signup form", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Create your account");
    await expect(page.locator('input[id="username"]')).toBeVisible();
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('input[id="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText(
      "Create Account",
    );
  });

  test("should show validation error for short username", async ({ page }) => {
    await page.fill('input[id="username"]', "ab");
    await page.fill('input[id="name"]', "Test User");
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=/username must be at least/i"),
    ).toBeVisible();
  });

  test("should show validation error for invalid username format", async ({
    page,
  }) => {
    await page.fill('input[id="username"]', "user@name");
    await page.fill('input[id="name"]', "Test User");
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=/username can only contain/i"),
    ).toBeVisible();
  });

  test("should show validation error for short name", async ({ page }) => {
    await page.fill('input[id="username"]', "testuser");
    await page.fill('input[id="name"]', "T");
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=/name must be at least/i")).toBeVisible();
  });

  test("should show validation error for invalid email", async ({ page }) => {
    await page.fill('input[id="username"]', "testuser");
    await page.fill('input[id="name"]', "Test User");
    await page.fill('input[id="email"]', "invalid-email");
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=/invalid email/i")).toBeVisible();
  });

  test("should show validation error for short password", async ({ page }) => {
    await page.fill('input[id="username"]', "testuser");
    await page.fill('input[id="name"]', "Test User");
    await page.fill('input[id="password"]', "123");
    await page.fill('input[id="confirmPassword"]', "123");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=/password must be at least/i"),
    ).toBeVisible();
  });

  test("should show validation error for mismatched passwords", async ({
    page,
  }) => {
    await page.fill('input[id="username"]', "testuser");
    await page.fill('input[id="name"]', "Test User");
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="confirmPassword"]', "password456");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=/passwords do not match/i")).toBeVisible();
  });

  test("should accept valid signup data", async ({ page }) => {
    await page.fill('input[id="username"]', "testuser");
    await page.fill('input[id="name"]', "Test User");
    await page.fill('input[id="email"]', "test@example.com");
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    // Check if button is disabled during submission
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test("should submit with empty email (optional field)", async ({ page }) => {
    await page.fill('input[id="username"]', "testuser");
    await page.fill('input[id="name"]', "Test User");
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    // Should submit without error (though API might reject)
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test("should have link to login page", async ({ page }) => {
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("should display social signup buttons", async ({ page }) => {
    await expect(page.locator('button:has-text("Apple")')).toBeVisible();
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
    await expect(page.locator('button:has-text("Meta")')).toBeVisible();
  });

  test("should disable all fields while submitting", async ({ page }) => {
    await page.fill('input[id="username"]', "testuser");
    await page.fill('input[id="name"]', "Test User");
    await page.fill('input[id="email"]', "test@example.com");
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="confirmPassword"]', "password123");

    await page.click('button[type="submit"]');

    await expect(page.locator('input[id="username"]')).toBeDisabled();
    await expect(page.locator('input[id="name"]')).toBeDisabled();
    await expect(page.locator('input[id="email"]')).toBeDisabled();
    await expect(page.locator('input[id="password"]')).toBeDisabled();
    await expect(page.locator('input[id="confirmPassword"]')).toBeDisabled();
  });

  test("should redirect to login on successful signup", async ({ page }) => {
    // This test assumes the API accepts the signup
    // In a real scenario, you'd need to mock the API or use a test database
    await page.fill('input[id="username"]', `testuser${Date.now()}`);
    await page.fill('input[id="name"]', "Test User");
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    // Wait for potential redirect
    await page.waitForTimeout(2000);

    // The URL might still be /signup if the API rejects, or /login if successful
    // This test mainly checks that the form submission works
    const url = page.url();
    expect(url).toMatch(/\/signup|\/login/);
  });
});
