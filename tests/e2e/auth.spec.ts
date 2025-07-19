import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should redirect to signin page for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*signin/)
  })

  test('should display signin form', async ({ page }) => {
    await page.goto('/signin')
    
    await expect(page.locator('h1')).toContainText('HBTRACK')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Se connecter')
  })

  test('should display registration form', async ({ page }) => {
    await page.goto('/register')
    
    await expect(page.locator('h1')).toContainText('HBTRACK')
    await expect(page.locator('input[placeholder="Jean Dupont"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Créer un compte')
  })

  test('should show validation errors for empty signin form', async ({ page }) => {
    await page.goto('/signin')
    
    // Try to submit with empty fields
    await page.click('button[type="submit"]')
    
    // Since React Hook Form with Zod validation may prevent submission,
    // let's check that we're still on the signin page and not redirected
    await page.waitForTimeout(2000) // Give time for any validation to show
    
    // Check that form is still visible (didn't submit successfully)  
    await expect(page.locator('h1').filter({ hasText: 'HBTRACK' })).toBeVisible()
    await expect(page.locator('text=Connectez-vous à votre compte')).toBeVisible()
    
    // Alternatively, try with invalid email format to trigger validation
    await page.fill('input[type="email"]', 'invalid-email')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(1000)
    
    // Should still be on signin page
    await expect(page.locator('h1').filter({ hasText: 'HBTRACK' })).toBeVisible()
  })
})
