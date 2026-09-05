import type { Meta, StoryObj } from '@storybook/angular';
import { DiffViewerComponent } from './diff-viewer.component';

const oldCode = `import { Component } from '@angular/core';

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

const newCode = `import { Component, input, output } from '@angular/core';

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

const meta: Meta<DiffViewerComponent> = {
  title: 'Diff/DiffViewer',
  component: DiffViewerComponent,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<DiffViewerComponent>;

/** Classic code-review view: decorator-era Angular migrated to signals. */
export const SideBySide: Story = {
  args: {
    oldText: oldCode,
    newText: newCode,
    oldLabel: 'user-card.component.ts (before)',
    newLabel: 'user-card.component.ts (after)',
  },
};

/** Unified view with +/- gutter signs. */
export const Inline: Story = {
  args: {
    oldText: oldCode,
    newText: newCode,
    mode: 'inline',
    oldLabel: 'before',
    newLabel: 'after',
  },
};

/** Identical inputs - the header reports no changes. */
export const NoChanges: Story = {
  args: {
    oldText: oldCode,
    newText: oldCode,
    oldLabel: 'v1',
    newLabel: 'v1 (copy)',
  },
};

/** Headerless, for embedding inside your own chrome. */
export const NoHeader: Story = {
  args: {
    oldText: 'alpha\nbeta\ngamma',
    newText: 'alpha\nBETA\ngamma\ndelta',
    hideHeader: true,
  },
};

/** Dark theme via CSS custom properties. */
export const DarkTheme: Story = {
  args: {
    oldText: oldCode,
    newText: newCode,
    oldLabel: 'before',
    newLabel: 'after',
  },
  decorators: [
    (story) => ({
      ...story(),
      template: `
        <div style="
          --ndv-bg:#0d1117; --ndv-ink:#c9d1d9; --ndv-muted:#8b949e;
          --ndv-border:#30363d; --ndv-blank-bg:#161b22;
          --ndv-add-bg:#12261e; --ndv-add-ink:#7ee787;
          --ndv-del-bg:#2d1215; --ndv-del-ink:#ffa198;
          background:#0d1117; padding:16px;">
          <ngx-diff-viewer [oldText]="oldText" [newText]="newText"
            [oldLabel]="oldLabel" [newLabel]="newLabel" />
        </div>`,
    }),
  ],
};
