import { Browser, BrowserContext, chromium, firefox, Page, webkit } from '@playwright/test';

require('dotenv').config();

const getEnv = (key: string) => process.env[key];
const getBaseUrl = () => getEnv('URL') ?? 'http://localhost';
const getViewport = () => ({ width: 1200, height: 800 });

export interface ITestParameters {
  browser: string;
  headless: boolean;
}

export class TestBed {
  #browser: Browser = null!;
  #context: BrowserContext | null = null;
  readonly closeBrowser = () => this.#browser?.close();
  readonly isBrowserInitialized = () => this.#browser !== null;

  async createBrowser({ browser, headless }: ITestParameters): Promise<void> {
    console.log('INIT', browser);
    switch (browser) {
      case 'FIREFOX':
        this.#browser = await firefox.launch({ headless });
        break;
      case 'WEBKIT':
        this.#browser = await webkit.launch({ headless });
        break;
      default:
        this.#browser = await chromium.launch({ headless });
        break;
    }
  }

  async createContext(): Promise<TestContext> {
    if (typeof this.#browser === 'undefined' || this.#browser === null)
      throw new Error('Browser is not initialized');

    if (!this.#browser.isConnected()) throw new Error('Browser is not connected');

    this.#context = await this.#browser.newContext({
      ignoreHTTPSErrors: true,
      recordVideo: { dir: 'reports/videos' },
      viewport: getViewport(),
      baseURL: getBaseUrl()
    });

    const page = await this.#context.newPage();
    await page.goto('/');
    return new TestContext(page);
  }
}

export class TestContext {
  constructor(protected readonly page: Page) {}

  readonly getEnv = getEnv;
  readonly getScreenshotAsBuffer = () => this.page.screenshot();
  readonly getPage = () => this.page;
  readonly removeVideo = async () => await this.page.video()?.delete();
  readonly getVideoPath = async () => (await this.page.video()?.path()) ?? Promise.resolve('');
  readonly close = async () => {
    await this.page.close();
    await this.page.context().close();
  };

  readonly getUserCredentials = (name: string) =>
    getEnv('USER_' + name.toUpperCase())?.split('|', 2) as [username: string, password: string];

  readonly getVideoAsEmbeddedHtml = async () => {
    const video = await this.getVideoPath();
    const videoName = video?.split(/\/|\\/g).pop();
    return `<video src="videos/${videoName}" style="max-width: 100%; height: auto;" controls=""></video>`;
  };
}

export const testBed = new TestBed();
