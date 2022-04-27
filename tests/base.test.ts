import {_electron as electron, Page} from "playwright";
import {expect, test} from "@playwright/test";

let electronApp;
test.beforeAll(async () => {
    electronApp = await electron.launch({
        args: ['ind.js'],
        executablePath: '/Applications/Microsoft Teams.app/Contents/MacOS/Teams'
    });
    const loading = await electronApp.firstWindow();
    await loading.waitForTimeout(5000)
});

test.afterAll(async () => {
    electronApp.close();
})

test("Launch electron app", async () => {
    const toolBar = await waitForPage(electronApp, 1)
    await toolBar.locator('[aria-label="Meet Toolbar"]').click();
    const extensionTab = await waitForPage(electronApp, 4)
    await extensionTab.frameLocator('iframe[name="extension-tab-frame"]').locator('button:has-text("Meet now")').first().click()
    await toolBar.waitForNavigation(/*{ url: 'https://teams.live.com/_#/apps/957ed0e3-e5ca-4c82-9676-fd037185c4d8/sections/459c9663-c6be-4181-8576-6de8ef0e9368' }*/);
    const meeting = await waitForPage(electronApp, 5, 10000)
    await meeting.locator('[aria-label="Join now"]').click({timeout: 15000});
    await meeting.locator('[aria-label="Show conversation"]').click();
    await meeting.type('div[role="textbox"]', 'hello');
    await meeting.locator('button[name="send"]').click();
    await meeting.locator('button[name="EmoticonPicker"]').click();
    await meeting.locator('.ui-button.abh').first().click();
    await meeting.locator('button[name="send"]').click();
    await meeting.locator('button:has-text("Leave")').click();
    await meeting.close();
});


test("Use the calendar", async () => {
    const page = await waitForPage(electronApp, 1)
    await page.locator('[aria-label="Calendar Toolbar"]').click();
    await page.locator('button:has-text("New meeting")').click();
    await page.locator('[placeholder="Add title"]').fill('jorge');
    await page.locator('[placeholder="Add title"]').press('Enter');
    await page.locator('[aria-label="Type details for this new meeting"]').fill('test');
    await page.locator('[aria-label="Type details for this new meeting"]').press('Enter');
    await page.locator('[aria-label="Save"]').click();
    await page.locator('button:has-text("Copy link")').click();
    // Click [aria-label="Close"]
    await Promise.all([
        page.waitForNavigation(/*{ url: 'https://teams.live.com/_?ring=ring3_6#/calendarv2' }*/),
        page.locator('[aria-label="Close"]').click()
    ]);
});


async function waitForPage(electronApp, page: number, timeout = 5000): Promise<Page> {
    await expect.poll(async () => {
        return electronApp.windows()[page];
    }, {timeout: timeout}).not.toBe(undefined);
    return electronApp.windows()[page]
}