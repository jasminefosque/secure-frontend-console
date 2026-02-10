import { test, expect } from '@playwright/test';

test.describe('Expense Tracker E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the application header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Expense Tracker' })).toBeVisible();
    await expect(page.getByText('Secure by Design Reference Implementation')).toBeVisible();
  });

  test('complete expense workflow: add, edit, export, delete', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Expense Tracker' })).toBeVisible();

    await expect(page.getByText('No expenses to display')).toBeVisible();

    await page.getByRole('button', { name: '+ Add Expense' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Add New Expense')).toBeVisible();

    await page.fill('#amount', '45.50');
    await page.fill('#description', 'Lunch at restaurant');
    await page.selectOption('#category', 'food');
    
    await page.getByRole('button', { name: 'Save Expense' }).click();

    await expect(page.getByText('Lunch at restaurant')).toBeVisible();
    await expect(page.getByText('$45.50')).toBeVisible();

    await expect(page.getByText('Expense added successfully')).toBeVisible();

    await expect(page.getByText('$45.50').first()).toBeVisible();

    await page.getByRole('button', { name: 'Edit expense' }).click();

    await expect(page.getByText('Edit Expense')).toBeVisible();

    await page.fill('#amount', '50.00');
    await page.getByRole('button', { name: 'Save Expense' }).click();

    await expect(page.getByText('$50.00')).toBeVisible();
    await expect(page.getByText('Expense updated successfully')).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export CSV' }).click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/expenses-.*\.csv/);

    await expect(page.getByText('Exported to CSV successfully')).toBeVisible();

    await page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete expense' }).click();

    await expect(page.getByText('No expenses to display')).toBeVisible();
  });

  test('should validate expense form inputs', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Expense' }).click();

    await page.fill('#amount', '-50');
    await page.fill('#description', 'Test');
    await page.getByRole('button', { name: 'Save Expense' }).click();

    await expect(page.getByText('Amount must be positive')).toBeVisible();

    await page.fill('#amount', '100');
    await page.fill('#description', '');
    await page.getByRole('button', { name: 'Save Expense' }).click();

    await expect(page.getByText('Description is required')).toBeVisible();
  });

  test('should calculate statistics correctly', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Expense' }).click();
    await page.fill('#amount', '100');
    await page.fill('#description', 'First expense');
    await page.selectOption('#category', 'food');
    await page.getByRole('button', { name: 'Save Expense' }).click();

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: '+ Add Expense' }).click();
    await page.fill('#amount', '200');
    await page.fill('#description', 'Second expense');
    await page.selectOption('#category', 'transport');
    await page.getByRole('button', { name: 'Save Expense' }).click();

    await expect(page.getByText('$300.00').first()).toBeVisible();
    
    await expect(page.getByText('$150.00').first()).toBeVisible();

    await expect(page.getByText('2').first()).toBeVisible();
  });

  test('should clear all expenses', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Expense' }).click();
    await page.fill('#amount', '50');
    await page.fill('#description', 'Test expense');
    await page.getByRole('button', { name: 'Save Expense' }).click();

    await expect(page.getByText('Test expense')).toBeVisible();

    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Clear All' }).click();

    await expect(page.getByText('No expenses to display')).toBeVisible();
  });
});
