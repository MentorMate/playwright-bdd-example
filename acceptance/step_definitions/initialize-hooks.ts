import {
  After,
  AfterAll,
  Before,
  ITestCaseHookParameter,
  setWorldConstructor,
  Status
} from '@cucumber/cucumber';

import { TestWorld } from '../driver/test-world';
import { testBed } from '../driver/test-bed';

setWorldConstructor(TestWorld);

Before(async function (this: TestWorld) {
  return await this.createBrowserContext();
});

After(async function (this: TestWorld, { result }: ITestCaseHookParameter) {
  if (result && result.status !== Status.PASSED) {
    const image = await this.context.getScreenshotAsBuffer();
    image && this.attach(image, 'image/png');
    const video = await this.context.getVideoAsEmbeddedHtml();
    video && this.attach(video, 'text/html');
  }

  await this.context.close();

  if (result && result.status === Status.PASSED) {
    await this.context.removeVideo();
  }
});

AfterAll(() => testBed.closeBrowser());
