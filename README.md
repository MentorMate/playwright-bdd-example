# BDD Acceptance Testing /Playwright & Cucumber/

<!-- TABLE OF CONTENTS -->
<details>
<summary>Table of Contents</summary>

1. [Run](#run)
1. [Packages](#packages)
1. [Example Report](#example-report)
1. [Code Overview](#code-overview)
1. [Tested Pages](#tested-pages)

</details>

## Run

```shell
pnpm install
pnpm run test
```

## Packages

* @cucumber/cucumber
* @playwright/test

## Example Report

![Playwright Report](/.docs/report.png "Report")

## Code Overview

The test runner is `cucumber-js` that is included in the `@cucumber/cucumber` package. The initial configurations are in `cucumber.js`.

```javascript
module.exports = {
  // configurations for command `cucumber-js`
  default: {
    paths: ['features/**/*.feature'],
    worldParameters: {
      browserName: 'EDGE'
    }
  },
  // configurations for command `cucumber-js -p chrome`
  chrome: {
    paths: ['features/**/*.feature'],
    worldParameters: {
      browserName: 'CHROME'
    }
  }
};
```

We use the parameters in the cucumber initialize hooks (see [initialize-hooks.ts](./acceptance//step_definitions/initialize-hooks.ts)):

```typescript
import { World } from '@cucumber/cucumber';

// runs before every cucumber Scenario:
Before(function (this: World) {
  console.log(this.parameters.browserName);
});
```

### Custom World

We create out custom world to handle browser initialization:

```typescript
import { World } from '@cucumber/cucumber';
import { testBed, TestContext, ITestParameters } from './test-bed';

export class TestWorld extends World<ITestParameters> implements IWorld {
  context: TestContext | null = null!;

  async createBrowserContext(): Promise<void> {
    if (!testBed.isBrowserInitialized()) {
      await testBed.createBrowser(this.parameters);
    }

    this.context = await testBed.createContext();
  }
}

setWorldConstructor(TestWorld);

// before scenario
Before(async function (this: TestWorld) {
  return await this.createBrowserContext();
});
```

### Test Bed

We create a testBed object to create the browser controller (in this case playwright):

```typescript
import { Browser, BrowserContext, Page } from '@playwright/test';

export class TestBed {
  #browser: Browser = null!;
  #context: BrowserContext | null = null;

  readonly isBrowserInitialized = () => this.#browser !== null;
  readonly closeBrowser = () => this.#browser?.close();

  async createBrowser(params: ITestParameters): Promise<void> {
    // create a new browser process.
    this.#browser = await firefox.launch({ });
  }

  async createContext(): Promise<TestContext> {
    // creates a new browser context (a browser window / set of pages)
    this.#context = await this.#browser.newContext({ });

    return new TestContext(
      // a new browser page/tab.
      await this.#context.newPage());
  }
}

export class TestContext {
  constructor(protected readonly page: Page) {}

  readonly getPage = () => this.page;
  readonly close = async () => {
    await this.page.close();
    await this.page.context().close();
  };
}

export const testBed = new TestBed();
```

We create the cucumber features:

```cucumber
Feature: Books library

  Scenario: Preview a book
    Given I go to 'Books'
```

```typescript
Before(async function (this: TestWorld) {
  await this.createBrowserContext();
});

Given('I go to {string}', async function (this: TestWorld, pageName: string) {
  const page = this.context.getPage();
  await page.locator(`.link[role=menuitem][title='${pageName}']`).click();
});

After(async function (this: TestWorld) {
  // close page and context
  await this.context.close();
});

AfterAll(() => testBed.closeBrowser());
```

## Tested Pages

**path:** /

```html
<section class="content">
  <!-- ... -->
  <button appButton
          aria-label="sign in"
          (click)="onLogin()">Login</button>
</section>
```

**path:** /singin

```html
<section class="content">
  <!-- ... -->
  <form role="form">
    <fieldset class="field"
              role="group">
      <label for="username"
             class="label">username:&nbsp;</label>
      <input #username
             id="username"
             type="text"
             placeholder="username"
             autocomplete="username"
             aria-label="username"
             required />
    </fieldset>
    <fieldset class="field"
              role="group">
      <label for="password"
             class="label">password:&nbsp;</label>
      <input #password
             id="password"
             type="password"
             placeholder="password"
             autocomplete="current-password"
             aria-label="password"
             required />
    </fieldset>
    <div *ngIf="error"
         class="error">{{error}}</div>
    <footer class="buttons" role="toolbar">
      <button appButton
              role="button"
              type="button"
              aria-label="sign in"
              (click)="login(username.value, password.value)">Sing In</button>
    </footer>
  </form>
</section>
```

**path:** /books

```html
<h1>Books</h1>
<fieldset>
  <input #searchBook
         id="searchBook"
         type="text"
         role="searchbox"
         placeholder="Search for a book"
         aria-label="search a book" />&nbsp;
  <button type="button"
          role="button"
          (click)="search(searchBook.value)"
          aria-controls="searchBook">Search</button>
  <div *ngIf="error"
       role="alert"
       class="error">{{error}}</div>
</fieldset>
<h2 id="table-caption">My Library</h2>
<table [attr.aria-busy]="loading"
       aria-labelledby="table-caption">
  <thead>
    <tr><th>Name</th></tr>
  </thead>
  <tbody>
    <tr *ngFor="let book of books$ | async; trackBy: trackById"
        class="book">
      <td class="name">{{book.name}}</td>
      <td><button (click)="preview(book)" [title]="'Preview ' + book.name">Preview</button></td>
    </tr>
  </tbody>
</table>
<div *ngIf="previewBook"
     class="preview-modal"
     role="dialog">
  <h3>Preview: {{previewBook.name}}</h3>
  <div>
    <b id="id">id:</b>
    <span aria-labelledby="id">{{previewBook.id}}</span>
  </div>
  <div>
    <b id="name">name:</b>
    <span aria-labelledby="name">{{previewBook.name}}</span>
  </div>
  <div>
    <b id="description">description:</b>
    <span aria-labelledby="description">{{previewBook.description}}</span>
  </div>
  <footer>
    <button (click)="this.previewBook = null">Close</button>
  </footer>
</div>
```

```typescript
@Component({ /** ... */ })
export class BooksComponent implements OnInit {
  readonly #http = inject(HttpClient);
  readonly trackById: TrackByFunction<Book> = (_, item) => item.id;
  loading = true;
  error: string | null = null;
  previewBook: Book | null = null;
  searchTerm$ = new BehaviorSubject<string | null>(null);
  initialBooks$ = new BehaviorSubject<Book[]>([]);
  books$ = combineLatest([this.initialBooks$, this.searchTerm$]).pipe(map(([books, term]) => /** ... */));

  ngOnInit(): void {
    this.#http
      .get<Book[]>('api/v1/books')
      .pipe(take(1))
      .subscribe({
        next: (data) => this.initialBooks$.next(data),
        error: (err) => console.error(err),
        complete: () => (this.loading = false)
      });
  }

  search(value: string): void {
    this.searchTerm$.next(value);
  }

  preview(book: Book): void {
    this.previewBook = book;
  }
}
```
