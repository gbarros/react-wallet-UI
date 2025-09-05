import { test, expect } from '@playwright/test'

// Optional Playwright smoke tests
// These tests run against a real browser and validate core user flows
// Only run when PLAYWRIGHT_SMOKE_TESTS=true environment variable is set

const shouldRunSmokeTests = process.env.PLAYWRIGHT_SMOKE_TESTS === 'true'

test.describe('WalletPanel Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    if (!shouldRunSmokeTests) {
      test.skip()
      return
    }

    // Navigate to demo app or test page
    await page.goto('http://localhost:3000') // Adjust URL as needed
  })

  test('should render wallet panel without crashing', async ({ page }) => {
    if (!shouldRunSmokeTests) {
      test.skip()
      return
    }

    // Wait for wallet panel to load
    await expect(page.locator('[data-testid="wallet-panel"]')).toBeVisible()
    
    // Check that basic tabs are present
    await expect(page.locator('role=tab[name=/balance/i]')).toBeVisible()
    await expect(page.locator('role=tab[name=/receive/i]')).toBeVisible()
    await expect(page.locator('role=tab[name=/send/i]')).toBeVisible()
    await expect(page.locator('role=tab[name=/sign/i]')).toBeVisible()
  })

  test('should navigate between tabs', async ({ page }) => {
    if (!shouldRunSmokeTests) {
      test.skip()
      return
    }

    // Click on receive tab
    await page.click('role=tab[name=/receive/i]')
    await expect(page.locator('[data-testid="receive-panel"]')).toBeVisible()
    
    // Click on send tab
    await page.click('role=tab[name=/send/i]')
    await expect(page.locator('[data-testid="send-panel"]')).toBeVisible()
    
    // Click on sign tab
    await page.click('role=tab[name=/sign/i]')
    await expect(page.locator('[data-testid="sign-panel"]')).toBeVisible()
  })

  test('should display wallet address in receive tab', async ({ page }) => {
    if (!shouldRunSmokeTests) {
      test.skip()
      return
    }

    // Navigate to receive tab
    await page.click('role=tab[name=/receive/i]')
    
    // Should show QR code
    await expect(page.locator('[data-testid="qr-code"]')).toBeVisible()
    
    // Should show wallet address
    await expect(page.locator('[data-testid="wallet-address"]')).toBeVisible()
    
    // Should have copy button
    await expect(page.locator('role=button[name=/copy/i]')).toBeVisible()
  })

  test('should validate send form inputs', async ({ page }) => {
    if (!shouldRunSmokeTests) {
      test.skip()
      return
    }

    // Navigate to send tab
    await page.click('role=tab[name=/send/i]')
    
    // Try to send without filling form
    await page.click('role=button[name=/send/i]')
    
    // Should show validation errors
    await expect(page.locator('text=/recipient.*required/i')).toBeVisible()
    await expect(page.locator('text=/amount.*required/i')).toBeVisible()
  })

  test('should show chain selector when enabled', async ({ page }) => {
    if (!shouldRunSmokeTests) {
      test.skip()
      return
    }

    // Should show chain selector button
    await expect(page.locator('[data-testid="chain-selector"]')).toBeVisible()
    
    // Click to open chain selector
    await page.click('[data-testid="chain-selector"]')
    
    // Should show chain options
    await expect(page.locator('text=Ethereum')).toBeVisible()
    await expect(page.locator('text=Polygon')).toBeVisible()
  })

  test('should handle wallet connection states', async ({ page }) => {
    if (!shouldRunSmokeTests) {
      test.skip()
      return
    }

    // Check for connection status indicators
    const connectionStatus = page.locator('[data-testid="connection-status"]')
    await expect(connectionStatus).toBeVisible()
    
    // Should show either connected or disconnected state
    const isConnected = await connectionStatus.textContent()
    expect(isConnected).toMatch(/(connected|disconnected)/i)
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    if (!shouldRunSmokeTests) {
      test.skip()
      return
    }

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Wallet panel should still be visible and functional
    await expect(page.locator('[data-testid="wallet-panel"]')).toBeVisible()
    
    // Tabs should be accessible
    await expect(page.locator('role=tab[name=/balance/i]')).toBeVisible()
    
    // Should be able to navigate
    await page.click('role=tab[name=/receive/i]')
    await expect(page.locator('[data-testid="receive-panel"]')).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    if (!shouldRunSmokeTests) {
      test.skip()
      return
    }

    // Focus on first tab
    await page.keyboard.press('Tab')
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowRight')
    
    // Should move to next tab
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toHaveAttribute('role', 'tab')
  })

  test('should copy address to clipboard', async ({ page }) => {
    if (!shouldRunSmokeTests) {
      test.skip()
      return
    }

    // Navigate to receive tab
    await page.click('role=tab[name=/receive/i]')
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    
    // Click copy button
    await page.click('role=button[name=/copy/i]')
    
    // Should show success message
    await expect(page.locator('text=/copied/i')).toBeVisible({ timeout: 5000 })
  })

  test('should handle network errors gracefully', async ({ page }) => {
    if (!shouldRunSmokeTests) {
      test.skip()
      return
    }

    // Simulate network failure
    await page.route('**/*', route => route.abort())
    
    // Try to refresh balance or perform action
    const refreshButton = page.locator('role=button[name=/refresh/i]')
    if (await refreshButton.isVisible()) {
      await refreshButton.click()
      
      // Should show error state
      await expect(page.locator('text=/error/i')).toBeVisible({ timeout: 10000 })
    }
  })
})

test.describe('WalletConnect Integration Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    if (!shouldRunSmokeTests || !process.env.VITE_WALLETCONNECT_PROJECT_ID) {
      test.skip()
      return
    }

    await page.goto('http://localhost:3000')
  })

  test('should show WalletConnect tab when enabled', async ({ page }) => {
    if (!shouldRunSmokeTests || !process.env.VITE_WALLETCONNECT_PROJECT_ID) {
      test.skip()
      return
    }

    await expect(page.locator('role=tab[name=/walletconnect/i]')).toBeVisible()
  })

  test('should open WalletConnect modal', async ({ page }) => {
    if (!shouldRunSmokeTests || !process.env.VITE_WALLETCONNECT_PROJECT_ID) {
      test.skip()
      return
    }

    // Navigate to WalletConnect tab
    await page.click('role=tab[name=/walletconnect/i]')
    
    // Click connect button
    await page.click('role=button[name=/connect/i]')
    
    // Should show WalletConnect modal or QR code
    await expect(page.locator('[data-testid="walletconnect-modal"]')).toBeVisible({ timeout: 10000 })
  })
})
