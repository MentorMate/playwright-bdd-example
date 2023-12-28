# Acceptance Testing

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
