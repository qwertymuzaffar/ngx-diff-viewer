import { Component, signal } from '@angular/core';
import { DiffViewerComponent, DiffViewMode } from 'ngx-diff-viewer';

const OLD_CODE = `import { Component } from '@angular/core';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
})
export class UserCardComponent {
  @Input() user: User;
  @Output() selected = new EventEmitter<User>();

  onClick() {
    this.selected.emit(this.user);
  }
}`;

const NEW_CODE = `import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  user = input.required<User>();
  selected = output<User>();

  onClick() {
    this.selected.emit(this.user());
  }
}`;

@Component({
  selector: 'app-root',
  imports: [DiffViewerComponent],
  template: `
    <header class="hero">
      <div>
        <h1>ngx-diff-viewer</h1>
        <p>Text diff viewer for Angular - built-in LCS diff, zero dependencies, themeable</p>
      </div>
      <button (click)="toggle()">{{ mode() === 'side-by-side' ? 'Inline view' : 'Side-by-side view' }}</button>
    </header>
    <main>
      <ngx-diff-viewer
        [oldText]="oldCode"
        [newText]="newCode"
        [mode]="mode()"
        oldLabel="user-card.component.ts (decorators)"
        newLabel="user-card.component.ts (signals)"
      />
    </main>
  `,
  styles: `
    :host { display: block; min-height: 100vh; background: #f1f5f9; font-family: -apple-system, 'Segoe UI', sans-serif; }
    .hero { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; background: #1e293b; color: #fff; }
    h1 { margin: 0; font-size: 20px; }
    .hero p { margin: 4px 0 0; font-size: 13px; color: #94a3b8; }
    button {
      background: #3b82f6; color: #fff; border: 0; border-radius: 6px;
      padding: 8px 14px; font-size: 13px; cursor: pointer;
    }
    main { padding: 24px; max-width: 1100px; margin: 0 auto; }
  `,
})
export class App {
  readonly mode = signal<DiffViewMode>('side-by-side');
  readonly oldCode = OLD_CODE;
  readonly newCode = NEW_CODE;

  toggle(): void {
    this.mode.update((m) => (m === 'side-by-side' ? 'inline' : 'side-by-side'));
  }
}
