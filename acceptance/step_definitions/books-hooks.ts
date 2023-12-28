import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { IWorld } from '../driver/test-world';
import { expect } from '@playwright/test';

//###  Global  ###

Given('I sign in as {word}', async function (this: IWorld, name: string) {
  const page = this.context.getPage();
  const [username, password] = this.context.getUserCredentials(name);
  await page.getByLabel('sign in').click();
  await page.getByLabel('username').fill(username);
  await page.getByLabel('password').fill(password!);
  await page.getByLabel('sign in').click();
});

Then('I see the {word} page', async function (this: IWorld, pageName: string) {
  const page = this.context.getPage();
  await page.waitForURL(new RegExp('/' + pageName + '$', 'i'));
});

//###  Common  ###

Given('I go to {string}', async function (this: IWorld, pageName: string) {
  const page = this.context.getPage();
  await page.locator(`.link[role=menuitem][title='${pageName}']`).click();
});

When(
  'I type {string} in the {string} field',
  async function (this: IWorld, value: string, field: string) {
    const page = this.context.getPage();
    await page.getByLabel(field).fill(value);
  }
);

When('I click the {string} button', async function (this: IWorld, buttonText: string) {
  const page = this.context.getPage();
  await page
    .getByRole('button')
    .and(page.getByText(buttonText).or(page.getByTitle(buttonText)))
    .click({ timeout: 5_000 });
});

Then('I see the {string} title', async function (this: IWorld, text: string) {
  const page = this.context.getPage();
  await page.getByRole('heading', { name: text }).waitFor();
});

Then('I wait for the table {string} to load', async function (this: IWorld, text: string) {
  const page = this.context.getPage();
  await page.getByLabel(text).and(page.locator('[aria-busy=false]')).waitFor({ timeout: 10_000 });
});

//###  Books  ###

Then('I see a book called {string}', async function (this: IWorld, book: string) {
  const page = this.context.getPage();
  const bookName = page.locator('.book .name');
  await expect(bookName).toHaveText(book, { timeout: 5000 });
});

Then('I see book details', async function (this: IWorld, data: DataTable) {
  const page = this.context.getPage();
  const dialog = page.getByRole('dialog');
  const rows = data.rows();
  for (let index = 0; index < rows.length; index++) {
    const [key, value] = rows[index];
    await expect(dialog.getByLabel(key)).toHaveText(value);
  }
});
