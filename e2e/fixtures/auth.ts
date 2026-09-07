import { Page, expect } from "@playwright/test";

export const DEMO_USERS = {
  director: { email: "director@demo.com", password: "demo123456" },
  manager: { email: "manager@demo.com", password: "demo123456" },
  staff: { email: "staff@demo.com", password: "demo123456" },
} as const;

export async function loginAs(page: Page, role: "director" | "manager" | "staff") {
  const { email, password } = DEMO_USERS[role];
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}
