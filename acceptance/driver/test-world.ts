import { IWorldOptions, World } from '@cucumber/cucumber';

import { testBed, TestContext, ITestParameters } from './test-bed';

export interface IWorld {
  context: TestContext;
}

export class TestWorld extends World<ITestParameters> implements IWorld {
  #context: TestContext | null = null!;

  constructor(options: IWorldOptions) {
    super(options);
  }

  get context(): TestContext {
    return this.#context!;
  }

  async createBrowserContext(): Promise<void> {
    if (!testBed.isBrowserInitialized()) {
      await testBed.createBrowser(this.parameters);
    }

    this.#context = await testBed.createContext();
  }
}
