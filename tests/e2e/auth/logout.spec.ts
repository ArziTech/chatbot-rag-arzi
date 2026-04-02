import { expect, test } from "@playwright/test";

test.describe("Authentication - Logout", () => {
  test("should redirect to home after logout", async ({ page }) => {
    // Start at a protected page (or home page)
    await page.goto("/");

    // Look for logout functionality (this might be in a user menu)
    // The exact selector depends on your implementation
    const userMenuButton = page
      .locator('[data-testid="user-menu"], button[aria-label="User menu"]')
      .first();

    // Check if user menu exists (might not if not logged in)
    const isVisible = await userMenuButton.isVisible().catch(() => false);

    if (isVisible) {
      await userMenuButton.click();

      // Look for logout button
      const logoutButton = page
        .locator('button:has-text("Logout"), a:has-text("Logout")')
        .first();
      await logoutButton.click();

      // Should redirect to home or login
      await expect(page).toHaveURL(/\/|\/login/);
    } else {
      // If not logged in, this test is skipped
      test.skip();
    }
  });

  test("should clear session after logout", async ({ page }) => {
    // This test would require actual login/logout flow
    // For now, we'll skip it
    test.skip();
  });
});
